-- 1. Create inventory reservation trigger function on order_item insert
CREATE OR REPLACE FUNCTION public.reserve_order_item_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_inv_id UUID;
  v_stock INT;
  v_reserved INT;
BEGIN
  -- Check if inventory tracking is enabled for the product
  SELECT id, quantity_on_hand, quantity_reserved INTO v_inv_id, v_stock, v_reserved
  FROM public.inventory
  WHERE product_id = NEW.product_id AND inventory_enabled = true;

  IF v_inv_id IS NOT NULL THEN
    -- Verify stock availability (available = on_hand - reserved)
    IF (v_stock - v_reserved) < NEW.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product % (Requested: %, Available: %)', NEW.product_name, NEW.quantity, (v_stock - v_reserved);
    END IF;

    -- Reserve the stock
    UPDATE public.inventory
    SET quantity_reserved = quantity_reserved + NEW.quantity,
        last_adjusted_at = now()
    WHERE product_id = NEW.product_id;

    -- Record a reservation movement/entry
    INSERT INTO public.inventory_reservations (inventory_id, product_id, order_id, reserved_quantity, status)
    VALUES (v_inv_id, NEW.product_id, NEW.order_id, NEW.quantity, 'ACTIVE');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trg_reserve_stock_on_order_item_insert ON public.order_items;

CREATE TRIGGER trg_reserve_stock_on_order_item_insert
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.reserve_order_item_stock();

-- 2. Create order status change handler to fulfill or cancel reservations
CREATE OR REPLACE FUNCTION public.handle_order_status_inventory_change()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- If order status changed to 'cancelled'
  IF NEW.order_status = 'cancelled' AND OLD.order_status <> 'cancelled' THEN
    -- Release reservations for all items
    FOR item IN SELECT * FROM public.order_items WHERE order_id = NEW.id LOOP
      UPDATE public.inventory
      SET quantity_reserved = GREATEST(0, quantity_reserved - item.quantity),
          last_adjusted_at = now()
      WHERE product_id = item.product_id;

      UPDATE public.inventory_reservations
      SET status = 'CANCELLED'
      WHERE order_id = NEW.id AND product_id = item.product_id AND status = 'ACTIVE';
    END LOOP;

  -- If order status changed to 'shipped' or 'delivered' from a non-shipped/non-delivered state
  ELSIF (NEW.order_status = 'shipped' OR NEW.order_status = 'delivered') 
    AND OLD.order_status <> 'shipped' AND OLD.order_status <> 'delivered' 
    AND OLD.order_status <> 'cancelled' THEN
    
    FOR item IN SELECT * FROM public.order_items WHERE order_id = NEW.id LOOP
      -- Deduct from on_hand and release reservation
      UPDATE public.inventory
      SET quantity_on_hand = GREATEST(0, quantity_on_hand - item.quantity),
          quantity_reserved = GREATEST(0, quantity_reserved - item.quantity),
          last_adjusted_at = now()
      WHERE product_id = item.product_id;

      -- Fulfill reservation
      UPDATE public.inventory_reservations
      SET status = 'FULFILLED'
      WHERE order_id = NEW.id AND product_id = item.product_id AND status = 'ACTIVE';

      -- Log movement
      INSERT INTO public.inventory_movements (inventory_id, product_id, movement_type, quantity_changed, previous_quantity, new_quantity, reason)
      SELECT id, product_id, 'DISPATCH', -item.quantity, quantity_on_hand + item.quantity, quantity_on_hand, 'Order Dispatch ' || NEW.order_number
      FROM public.inventory
      WHERE product_id = item.product_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trg_handle_order_status_inventory_change ON public.orders;

CREATE TRIGGER trg_handle_order_status_inventory_change
AFTER UPDATE OF order_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_status_inventory_change();

-- 3. Restrict RLS policies on orders and order_items (Admins and service_role only)
DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public select order_items" ON public.order_items;

-- Create policies to restrict client writes (only Admin or Service Role)
CREATE POLICY "Allow public insert to orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select own orders" ON public.orders FOR SELECT USING (public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Allow update own orders" ON public.orders FOR UPDATE USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Allow public insert to order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select own order_items" ON public.order_items FOR SELECT USING (public.is_admin() OR auth.role() = 'service_role');
