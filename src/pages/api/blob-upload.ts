import type { APIRoute } from 'astro';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { validateAdminPassword } from '../../lib/site-config';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
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

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/avif',
            'video/mp4',
            'video/quicktime',
            'video/webm',
          ],
          maximumSizeInBytes: 150 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
          tokenPayload: JSON.stringify({ kind: payload.kind ?? 'media' }),
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
