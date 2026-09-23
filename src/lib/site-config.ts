import { list, put } from '@vercel/blob';

export type FitMode = 'cover' | 'contain';

export interface MediaAsset {
  url: string;
  positionX: number;
  positionY: number;
  zoom: number;
  fit: FitMode;
}

export interface SiteConfig {
  background: {
    url: string;
    opacity: number;
    positionX: number;
    positionY: number;
    zoom: number;
    fit: FitMode;
  };
  media: {
    profile: MediaAsset;
    product: MediaAsset;
    unboxing: MediaAsset;
    fitting: MediaAsset;
  };
}

const asset = (url: string, fit: FitMode = 'cover'): MediaAsset => ({
  url,
  positionX: 50,
  positionY: 50,
  zoom: 100,
  fit,
});

export const DEFAULT_CONFIG: SiteConfig = {
  background: {
    url: '/hero-fundo-leticia.jpg',
    opacity: 100,
    positionX: 50,
    positionY: 52,
    zoom: 100,
    fit: 'cover',
  },
  media: {
    profile: asset('/foto-perfil.jpg'),
    product: asset('/portfolio-produto.jpg'),
    unboxing: asset('/portfolio-unboxing.mp4'),
    fitting: asset('/portfolio-provador.jpg'),
  },
};

const CONFIG_PATH = 'portfolio-leticia/config.json';

function numberInRange(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeAsset(input: unknown, fallback: MediaAsset): MediaAsset {
  if (typeof input === 'string') {
    return { ...fallback, url: input || fallback.url };
  }

  const value = (input && typeof input === 'object' ? input : {}) as Partial<MediaAsset>;
  return {
    url: typeof value.url === 'string' && value.url ? value.url : fallback.url,
    positionX: numberInRange(value.positionX, fallback.positionX, 0, 100),
    positionY: numberInRange(value.positionY, fallback.positionY, 0, 100),
    zoom: numberInRange(value.zoom, fallback.zoom, 70, 220),
    fit: value.fit === 'contain' ? 'contain' : 'cover',
  };
}

export function normalizeConfig(input: Partial<SiteConfig> | null | undefined): SiteConfig {
  const bg = input?.background ?? {};
  const media = input?.media ?? {};

  return {
    background: {
      url: typeof bg.url === 'string' && bg.url ? bg.url : DEFAULT_CONFIG.background.url,
      opacity: numberInRange(bg.opacity, DEFAULT_CONFIG.background.opacity, 0, 100),
      positionX: numberInRange(bg.positionX, DEFAULT_CONFIG.background.positionX, 0, 100),
      positionY: numberInRange(bg.positionY, DEFAULT_CONFIG.background.positionY, 0, 100),
      zoom: numberInRange(bg.zoom, DEFAULT_CONFIG.background.zoom, 70, 220),
      fit: bg.fit === 'contain' ? 'contain' : 'cover',
    },
    media: {
      profile: normalizeAsset((media as any).profile, DEFAULT_CONFIG.media.profile),
      product: normalizeAsset((media as any).product, DEFAULT_CONFIG.media.product),
      unboxing: normalizeAsset((media as any).unboxing, DEFAULT_CONFIG.media.unboxing),
      fitting: normalizeAsset((media as any).fitting, DEFAULT_CONFIG.media.fitting),
    },
  };
}

export async function readSiteConfig(): Promise<SiteConfig> {
  try {
    const result = await list({ prefix: CONFIG_PATH, limit: 10 });
    const blob = result.blobs.find((item) => item.pathname === CONFIG_PATH);
    if (!blob) return DEFAULT_CONFIG;

    const response = await fetch(blob.url, { cache: 'no-store' });
    if (!response.ok) return DEFAULT_CONFIG;
    return normalizeConfig(await response.json());
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function writeSiteConfig(input: Partial<SiteConfig>): Promise<SiteConfig> {
  const config = normalizeConfig(input);
  await put(CONFIG_PATH, JSON.stringify(config), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
  return config;
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function validateAdminPassword(password: string | null | undefined) {
  const configured = import.meta.env.ADMIN_PASSWORD;
  if (configured) {
    if (!password || password !== configured) {
      return { ok: false as const, status: 401, error: 'INVALID_PASSWORD' };
    }
    return { ok: true as const };
  }

  if (!password || await sha256(password) !== '3a560af98d3b3f1cded74f62e8735a28cc0088f6fccab0455fda30f0e4de4c5f') {
    return { ok: false as const, status: 401, error: 'INVALID_PASSWORD' };
  }

  return { ok: true as const };
}
