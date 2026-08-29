import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/firebase_messaging';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const connectionApiKey = Deno.env.get('FIREBASE_MESSAGING_API_KEY');
    if (!LOVABLE_API_KEY || !connectionApiKey) return json({ error: 'Push is not configured' }, 500);

    const authHeader = req.headers.get('Authorization') ?? '';
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401);

    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
    if (!isAdmin) return json({ error: 'Admins only' }, 403);

    const body = await req.json().catch(() => ({}));
    const notificationId: string | undefined = body?.notificationId;
    if (!notificationId || typeof notificationId !== 'string') return json({ error: 'notificationId is required' }, 400);

    const { data: notif, error: notifErr } = await admin
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .maybeSingle();
    if (notifErr || !notif) return json({ error: 'Notification not found' }, 404);

    let query = admin.from('push_subscribers').select('id, token, user_id');
    if (notif.audience === 'user') {
      if (!notif.target_user_id) return json({ error: 'Target user missing' }, 400);
      query = query.eq('user_id', notif.target_user_id);
    }
    const { data: subs, error: subsErr } = await query;
    if (subsErr) return json({ error: subsErr.message }, 500);
    if (!subs || subs.length === 0) {
      await admin.from('notifications').update({ status: 'failed', error: 'No subscribed devices', sent_count: 0, failed_count: 0 }).eq('id', notif.id);
      return json({ error: 'No subscribed devices for this audience' }, 400);
    }

    const data: Record<string, string> = {
      title: String(notif.title ?? ''),
      body: String(notif.body ?? ''),
      url: String(notif.url ?? '/'),
    };
    if (notif.banner_url) data.banner = String(notif.banner_url);
    if (notif.tag) data.tag = String(notif.tag);

    let sent = 0;
    const stale: string[] = [];
    const errors: string[] = [];

    for (const sub of subs) {
      const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': connectionApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: sub.token,
            data,
            webpush: {
              notification: {
                title: data.title,
                body: data.body,
                image: data.banner,
                tag: data.tag,
                icon: '/favicon.ico',
              },
              fcm_options: { link: data.url },
            },
          },
        }),
      });

      if (res.ok) {
        sent++;
        continue;
      }
      const errText = await res.text();
      console.error(`FCM send failed [${res.status}]: ${errText}`);
      if (res.status === 404 || res.status === 400) stale.push(sub.token);
      if (errors.length < 3) errors.push(`[${res.status}] ${errText.slice(0, 200)}`);
    }

    if (stale.length) await admin.from('push_subscribers').delete().in('token', stale);

    const failed = subs.length - sent;
    await admin
      .from('notifications')
      .update({
        status: sent > 0 ? 'sent' : 'failed',
        sent_count: sent,
        failed_count: failed,
        sent_at: new Date().toISOString(),
        error: errors.length ? errors.join(' | ') : null,
      })
      .eq('id', notif.id);

    return json({ sent, failed, removed_stale: stale.length, errors });
  } catch (e) {
    console.error('send-notification error', e);
    return json({ error: (e as Error).message }, 500);
  }
});
