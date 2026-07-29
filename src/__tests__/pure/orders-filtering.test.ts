import { describe, it, expect } from 'vitest';

interface LocalOrder {
  order_number: string;
  customer_name: string;
  order_status: string;
}

function filterOrdersList(list: LocalOrder[], search: string, status: string): LocalOrder[] {
  return list.filter(o => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                        o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || o.order_status === status;
    return matchSearch && matchStatus;
  });
}

describe('Orders Filtering Logic', () => {
  const list: LocalOrder[] = [
    { order_number: 'ORD-1001', customer_name: 'John Doe', order_status: 'new' },
    { order_number: 'ORD-1002', customer_name: 'Jane Smith', order_status: 'shipped' },
    { order_number: 'ORD-1003', customer_name: 'Ram Kumar', order_status: 'new' }
  ];

  it('should filter by search query', () => {
    const res = filterOrdersList(list, 'Smith', 'all');
    expect(res.length).toBe(1);
    expect(res[0].order_number).toBe('ORD-1002');
  });

  it('should filter by status', () => {
    const res = filterOrdersList(list, '', 'new');
    expect(res.length).toBe(2);
  });
});
