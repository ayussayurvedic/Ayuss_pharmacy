import { describe, it, expect } from 'vitest';

interface LocalReturn {
  status: string;
}

function getReturnSummary(list: LocalReturn[]) {
  return {
    all: list.length,
    pending: list.filter(r => r.status === 'requested' || r.status === 'under_review').length,
    transit: list.filter(r => r.status === 'pickup_scheduled' || r.status === 'in_transit').length
  };
}

describe('Returns Summary Logic', () => {
  const list: LocalReturn[] = [
    { status: 'requested' },
    { status: 'under_review' },
    { status: 'pickup_scheduled' },
    { status: 'completed' }
  ];

  it('should calculate counts correctly', () => {
    const summary = getReturnSummary(list);
    expect(summary.all).toBe(4);
    expect(summary.pending).toBe(2);
    expect(summary.transit).toBe(1);
  });
});
