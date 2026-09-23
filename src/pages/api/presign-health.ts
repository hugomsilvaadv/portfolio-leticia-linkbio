import type { APIRoute } from 'astro';
import { issueSignedToken } from '@vercel/blob';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const storeId = process.env.BLOB_STORE_ID ?? import.meta.env.BLOB_STORE_ID;
    const oidcToken = process.env.VERCEL_OIDC_TOKEN ?? import.meta.env.VERCEL_OIDC_TOKEN;

    if (!storeId) throw new Error('BLOB_STORE_ID_MISSING');

    const token = await issueSignedToken({
      pathname: 'portfolio-leticia/media/healthcheck.txt',
      operations: ['put'],
      validUntil: Date.now() + 5 * 60 * 1000,
      allowedContentTypes: ['text/plain'],
      maximumSizeInBytes: 1024,
      storeId,
      ...(oidcToken ? { oidcToken } : {}),
    });

    return new Response(JSON.stringify({
      ok: true,
      storeIdPresent: Boolean(storeId),
      oidcPresent: Boolean(oidcToken),
      signedTokenCreated: Boolean(token),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
};
