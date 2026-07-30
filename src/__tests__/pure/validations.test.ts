import { describe, it, expect } from 'vitest';
import {
  changePasswordSchema,
} from '@/lib/validations';

describe('Validation Schemas — validations.ts', () => {
  describe('changePasswordSchema', () => {
    it('under 12 characters -> fails', () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: 'old',
        newPassword: 'Short12!',
        confirmPassword: 'Short12!',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('at least 12 characters');
      }
    });

    it('no uppercase letter -> fails', () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: 'old',
        newPassword: 'shortpass123!',
        confirmPassword: 'shortpass123!',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('uppercase');
      }
    });

    it('no lowercase letter -> fails', () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: 'old',
        newPassword: 'SHORTPASS123!',
        confirmPassword: 'SHORTPASS123!',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('lowercase');
      }
    });

    it('no number -> fails', () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: 'old',
        newPassword: 'ShortPassWords!',
        confirmPassword: 'ShortPassWords!',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('number');
      }
    });

    it('no special character -> fails', () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: 'old',
        newPassword: 'ShortPassword123',
        confirmPassword: 'ShortPassword123',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('special character');
      }
    });

    it('passwords do not match -> fails', () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: 'old',
        newPassword: 'ValidPass123!',
        confirmPassword: 'DifferentPass123!',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("Passwords don't match");
      }
    });

    it('valid password >= 12 characters -> passes', () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: 'old',
        newPassword: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
      });
      expect(res.success).toBe(true);
    });
  });


});
