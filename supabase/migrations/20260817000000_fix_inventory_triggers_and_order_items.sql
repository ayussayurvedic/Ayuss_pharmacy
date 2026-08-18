-- Migration: Fix inventory reservation and order trigger functions to use product_id instead of id

-- 1. Replace reserve_order_item_stock trigger function
CREATE OR REPLACE FUNCTION public.reserve_order_item_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_stock INT;
  v_reserved INT;
  v_enabled BOOLEAN;
BEGIN
  -- Check if inventory tracking is enabled for the product
  SELECT quantity_on_hand, quantity_reserved, inventory_enabled 
  INTO v_stock, v_reserved, v_enabled
  FROM public.inventory
  WHERE product_id = NEW.product_id;

  -- Only perform reservation if product exists in inventory and tracking is active
  IF FOUND AND v_enabled = true THEN
    -- Verify stock availability (available = on_hand - reserved)
    IF (v_stock - v_reserved) < NEW.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product % (Requested: %, Available: %)', NEW.product_name, NEW.quantity, (v_stock - v_reserved);
    END IF;

    -- Reserve the stock
    UPDATE public.inventory
    SET quantity_reserved = quantity_reserved + NEW.quantity,
        last_adjusted_at = now()
    WHERE product_id = NEW.product_id;

    -- Record a reservation movement/entry if inventory_reservations table exists
    INSERT INTO public.inventory_reservations (product_id, order_id, reserved_quantity, status)
    VALUES (NEW.product_id, NEW.order_id, NEW.quantity, 'ACTIVE')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on public.order_items
DROP TRIGGER IF EXISTS trg_reserve_stock_on_order_item_insert ON public.order_items;
CREATE TRIGGER trg_reserve_stock_on_order_item_insert
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.reserve_order_item_stock();


-- 2. Replace handle_order_status_inventory_change trigger function
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

      -- Log movement if inventory_movements table exists
      INSERT INTO public.inventory_movements (product_id, movement_type, quantity_changed, previous_quantity, new_quantity, reason)
      SELECT product_id, 'DISPATCH', -item.quantity, quantity_on_hand + item.quantity, quantity_on_hand, 'Order Dispatch ' || NEW.order_number
      FROM public.inventory
      WHERE product_id = item.product_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on public.orders
DROP TRIGGER IF EXISTS trg_handle_order_status_inventory_change ON public.orders;
CREATE TRIGGER trg_handle_order_status_inventory_change
AFTER UPDATE OF order_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_status_inventory_change();

-- 3. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
