import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Supabase Environment Configuration', () => {
  it('should connect to the authoritative S.S. Pharmacy database URL in .env', () => {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    expect(envContent).toContain('NEXT_PUBLIC_SUPABASE_URL=https://xqtqrvfghravibygnvyf.supabase.co');
  });

  it('should have a defined anon key in .env', () => {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    expect(envContent).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdHFydmZnaHJhdmlieWdudnlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzYwMjcsImV4cCI6MjEwMDQxMjAyN30.pW4Q3eQHr2N5Hr0fqZrKgK6Uw4cJoLCTooI5b5CDWJs');
  });
});
