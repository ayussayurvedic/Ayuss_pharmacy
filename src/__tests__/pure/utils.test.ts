import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/utils';

describe('Utility Functions — utils.ts', () => {


  describe('formatDate()', () => {
    it('returns formatted string for valid Date input', () => {
      const date = new Date(Date.UTC(2026, 4, 29));
      expect(formatDate(date)).toContain('2026');
    });

    it('returns formatted string for valid ISO string input', () => {
      expect(formatDate('2026-05-29T10:00:00Z')).toContain('2026');
    });
  });
});
