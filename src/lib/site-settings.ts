import { createClient } from '@/lib/supabase/client';

export interface SiteSettings {
  supportPhone: string;
  supportEmail: string;
  tradeName: string;
  legalBusinessName: string;
  address: string;
  rawPhone: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  supportPhone: '',
  supportEmail: 'ayuss.ayurvedic@gmail.com',
  tradeName: 'S.S. PHARMACY',
  legalBusinessName: 'S.S. PHARMACY',
  address: 'Prakash Nagar, Yerraguntla, YSR Kadapa Dist., A.P. - 516309',
  rawPhone: '',
};

/**
 * Normalizes phone number into WhatsApp international format without leading + or special characters
 */
export function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Formats a phone number for user-facing display (e.g. +91 99669 64340)
 */
export function formatDisplayPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return phone;
}

/**
 * Fetches dynamic business and contact settings from Supabase database
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('business_tax_settings')
      .select('support_phone, support_email, trade_name, legal_business_name, registered_address_line1, city, state, postal_code')
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    const rawPhone = data.support_phone || '';
    const addressParts = [
      data.registered_address_line1,
      data.city,
      data.state ? `${data.state}${data.postal_code ? ` - ${data.postal_code}` : ''}` : data.postal_code
    ].filter(Boolean);

    return {
      supportPhone: rawPhone,
      supportEmail: data.support_email || DEFAULT_SITE_SETTINGS.supportEmail,
      tradeName: data.trade_name || DEFAULT_SITE_SETTINGS.tradeName,
      legalBusinessName: data.legal_business_name || DEFAULT_SITE_SETTINGS.legalBusinessName,
      address: addressParts.length > 0 ? addressParts.join(', ') : DEFAULT_SITE_SETTINGS.address,
      rawPhone,
    };
  } catch (err) {
    console.warn('Could not fetch site settings from database, using defaults:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}
