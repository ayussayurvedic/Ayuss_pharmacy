import { describe, it, expect } from 'vitest';

describe('Supabase Environment Configuration', () => {
  it('should connect to a defined Supabase database URL', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(url).toBeDefined();
    expect(url).toContain('supabase.co');
  });

  it('should have a defined anon key', () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
  });
});
