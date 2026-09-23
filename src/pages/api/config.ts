import type { APIRoute } from 'astro';
import { readSiteConfig, validateAdminPassword, writeSiteConfig } from '../../lib/site-config';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
};

export const GET: APIRoute = async () => {
  const config = await readSiteConfig();
  return new Response(JSON.stringify(config), { status: 200, headers });
};

export const POST: APIRoute = async ({ request }) => {
  const auth = validateAdminPassword(request.headers.get('x-admin-password'));
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers });
  }

  try {
    const payload = await request.json();
    const config = await writeSiteConfig(payload);
    return new Response(JSON.stringify({ ok: true, config }), { status: 200, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SAVE_FAILED';
    const status = message === 'BLOB_NOT_CONFIGURED' ? 503 : 500;
    return new Response(JSON.stringify({ error: message }), { status, headers });
  }
};
