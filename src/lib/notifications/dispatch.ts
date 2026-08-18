import webpush from 'web-push';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  admin_id?: string | null;
}

// Track VAPID initialization status
let isVapidInitialized = false;

function initVapid() {
  if (isVapidInitialized) return true;

  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = env.VAPID_PRIVATE_KEY;
  const subject = env.VAPID_SUBJECT || 'mailto:ayuss.ayurvedic@gmail.com';

  if (!publicKey || !privateKey) {
    console.warn('⚠️ Web Push VAPID keys are missing. Push notifications will be logged to console in mock mode.');
    return false;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    isVapidInitialized = true;
    return true;
  } catch (err) {
    console.error('Failed to initialize Web Push VAPID details:', err);
    return false;
  }
}

interface DispatchNotificationOptions {
  title: string;
  message: string;
  type: string; // e.g. 'order_created', 'distributor_applied', 'inquiry_received', 'system_alert'
  adminId?: string | null;    // Targeted admin
  clickActionUrl?: string;    // Direct navigation URL
  senderName?: string;        // In-app notification sender
  skipInApp?: boolean;        // Bypass in-app database insertion
}

/**
 * Dispatch a notification cohesively:
 * 1. Insert into in-app notifications table.
 * 2. Filter target's notification preferences from the DB.
 * 3. Fetch push subscriptions (mapping to admin_id).
 * 4. Dispatch encrypted Web Push payloads and prune stale subscriptions on error.
 */
export async function dispatchNotification(options: DispatchNotificationOptions) {
  const { title, message, type, adminId, clickActionUrl, senderName = 'System', skipInApp = false } = options;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Dispatch] Initiating notification "${title}": "${message}" (Type: ${type})`);
  }

  // 1. In-App Notification insertion
  let inAppNotificationId: string | null = null;
  if (!skipInApp) {
    try {
      const insertData: Record<string, unknown> = {
        title,
        message,
        type: type.includes('alert') ? 'alert' : type.includes('announcement') ? 'announcement' : 'personal',
        sender_name: senderName,
        is_read: false,
        is_for_admin: true
      };

      if (adminId) {
        insertData.admin_id = adminId;
      }

      const { data: insertedNotif, error: insertError } = await supabaseAdmin
        .from('notifications')
        .insert([insertData])
        .select('id')
        .single();

      if (insertError) {
        console.error('Failed to insert in-app notification record:', insertError);
      } else {
        inAppNotificationId = insertedNotif.id;
        revalidatePath('/admin/notifications');
      }
    } catch (err) {
      console.error('Error during in-app notification registration:', err);
    }
  }

  // 2. Resolve target push subscriptions & preference check
  let subscriptions: PushSubscriptionRow[] = [];
  try {
    if (adminId) {
      // Admin preference check
      const { data: adminUser, error: adminErr } = await supabaseAdmin
        .from('admin_users')
        .select('notification_preferences')
        .eq('id', adminId)
        .maybeSingle();

      if (!adminErr && adminUser) {
        const preferences = adminUser.notification_preferences || {};
        const isEnabled = preferences[type] !== false; // Default to true if not explicitly false
        if (!isEnabled) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[Dispatch] Admin ${adminId} has disabled notifications of type "${type}". Aborting push.`);
          }
          return { success: true, reason: 'Disabled by user preferences' };
        }
      }

      // Fetch active subscriptions for target admin
      const { data: adminSubs } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .eq('admin_id', adminId)
        .eq('is_active', true);
      
      subscriptions = (adminSubs || []) as unknown as PushSubscriptionRow[];
    } else {
      // Broadcast / Announcement to all active admins
      const { data: adminSubs } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .eq('is_active', true)
        .not('admin_id', 'is', null);

      subscriptions = (adminSubs || []) as unknown as PushSubscriptionRow[];
    }
  } catch (err) {
    console.error('Failed to resolve target subscriptions and preferences:', err);
    return { success: false, error: 'Database query failure' };
  }

  if (subscriptions.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Dispatch] No active push subscriptions found for targets.');
    }
    return { success: true, inAppNotificationId, pushSentCount: 0 };
  }

  // 3. Web Push transmission
  const hasVapid = initVapid();
  const pushPayload = JSON.stringify({
    title,
    message,
    clickActionUrl: clickActionUrl || '/admin/dashboard',
    tag: type
  });

  let pushSentCount = 0;
  let pruneCount = 0;

  for (const sub of subscriptions) {
    if (!hasVapid) {
      // Mock mode
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Push Notification Mock] Endpoint: ${sub.endpoint}, Payload: ${pushPayload}`);
      }
      pushSentCount++;
      continue;
    }

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        },
        pushPayload
      );
      pushSentCount++;
    } catch (err) {
      const error = err as { message?: string; statusCode?: number };
      console.error(`Failed to deliver push notification to subscriber ${sub.id}:`, error.message);
      
      // Auto-prune invalid/expired subscription endpoints (standard Web Push behavior)
      if (error.statusCode === 404 || error.statusCode === 410 || error.statusCode === 414) {
        try {
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
          pruneCount++;
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[Prune] Deleted expired subscription endpoint: ${sub.id}`);
          }
        } catch (dbErr) {
          console.error(`Failed to prune expired subscription ${sub.id}:`, dbErr);
        }
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Dispatch Complete] Sent: ${pushSentCount}, Pruned: ${pruneCount}`);
  }
  return { success: true, inAppNotificationId, pushSentCount, prunedCount: pruneCount };
}
