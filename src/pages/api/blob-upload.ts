import type { APIRoute } from 'astro';
import { issueSignedToken } from '@vercel/blob';
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from '@vercel/blob/client';
import { validateAdminPassword } from '../../lib/site-config';

export const prerender = false;

const allowedContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as HandleUploadPresignedBody;

    const storeId = process.env.BLOB_STORE_ID ?? import.meta.env.BLOB_STORE_ID;
    const oidcToken = process.env.VERCEL_OIDC_TOKEN ?? import.meta.env.VERCEL_OIDC_TOKEN;
    const webhookPublicKey =
      process.env.BLOB_WEBHOOK_PUBLIC_KEY ?? import.meta.env.BLOB_WEBHOOK_PUBLIC_KEY;

    if (!storeId) {
      throw new Error('BLOB_STORE_ID_MISSING');
    }

    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      webhookPublicKey,
      getSignedToken: async (pathname, clientPayload) => {
        let payload: { password?: string; kind?: string } = {};
        try {
          payload = clientPayload ? JSON.parse(clientPayload) : {};
        } catch {
          throw new Error('INVALID_PAYLOAD');
        }

        const auth = await validateAdminPassword(payload.password);
        if (!auth.ok) throw new Error(auth.error);

        if (!pathname.startsWith('portfolio-leticia/media/')) {
          throw new Error('INVALID_PATH');
        }

        const token = await issueSignedToken({
          pathname,
          operations: ['put'],
          validUntil: Date.now() + 15 * 60 * 1000,
          allowedContentTypes,
          maximumSizeInBytes: 150 * 1024 * 1024,
          storeId,
          ...(oidcToken ? { oidcToken } : {}),
        });

        return {
          token,
          urlOptions: {
            allowedContentTypes,
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 60,
          },
        };
      },
      onUploadCompleted: async () => {},
    });

    return new Response(JSON.stringify(jsonResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UPLOAD_FAILED';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
};
