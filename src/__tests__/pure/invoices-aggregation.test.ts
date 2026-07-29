import { describe, it, expect } from 'vitest';

interface LocalInvoice {
  taxable_value: number;
  grand_total: number;
}

function getInvoicesAggregate(list: LocalInvoice[]) {
  return {
    taxable: list.reduce((acc, i) => acc + i.taxable_value, 0),
    grand: list.reduce((acc, i) => acc + i.grand_total, 0)
  };
}

describe('Invoices Totals Aggregation', () => {
  const list: LocalInvoice[] = [
    { taxable_value: 1000, grand_total: 1120 },
    { taxable_value: 2000, grand_total: 2240 }
  ];

  it('should aggregate totals correctly', () => {
    const totals = getInvoicesAggregate(list);
    expect(totals.taxable).toBe(3000);
    expect(totals.grand).toBe(3360);
  });
});
