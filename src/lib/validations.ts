import { z } from 'zod';

export const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  requirement: z.string().min(10, 'Please describe your requirement (min 10 characters)'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(12, 'New password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'sharklasers.com',
  'trashmail.com',
  'temp-mail.org',
  'dispostable.com',
]);

/**
 * Validates whether an email is from a temporary / disposable email service.
 * Uses local blocklist and the free EVA API (public-apis/public-apis).
 */
export async function isDisposableEmail(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const domain = cleanEmail.split('@')[1];
  if (!domain) return false;

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return true;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`https://api.eva.pingutil.com/email?email=${encodeURIComponent(cleanEmail)}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.disposable === true) {
        return true;
      }
    }
  } catch {
    // Soft fallback to local list on network timeout
  }

  return false;
}

export type InquiryFormData = z.infer<typeof inquirySchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;



