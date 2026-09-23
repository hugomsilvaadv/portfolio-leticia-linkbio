import type { APIRoute } from 'astro';
import { list, put } from '@vercel/blob';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const before = await list({ prefix: 'portfolio-leticia/', limit: 5 });
    const blob = await put('portfolio-leticia/healthcheck.txt', 'ok', {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'text/plain',
      cacheControlMaxAge: 60,
    });

    return new Response(JSON.stringify({
      ok: true,
      readable: true,
      writable: true,
      found: before.blobs.length,
      url: blob.url,
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
