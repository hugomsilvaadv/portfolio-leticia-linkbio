import { list, put } from '@vercel/blob';

export type FitMode = 'cover' | 'contain';

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
    profile: string;
    product: string;
    unboxing: string;
    fitting: string;
  };
}

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
    profile: '/foto-perfil.jpg',
    product: '/portfolio-produto.jpg',
    unboxing: '/portfolio-unboxing.mp4',
    fitting: '/portfolio-provador.jpg',
  },
};

const CONFIG_PATH = 'portfolio-leticia/config.json';

function numberInRange(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
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
      profile: typeof media.profile === 'string' && media.profile ? media.profile : DEFAULT_CONFIG.media.profile,
      product: typeof media.product === 'string' && media.product ? media.product : DEFAULT_CONFIG.media.product,
      unboxing: typeof media.unboxing === 'string' && media.unboxing ? media.unboxing : DEFAULT_CONFIG.media.unboxing,
      fitting: typeof media.fitting === 'string' && media.fitting ? media.fitting : DEFAULT_CONFIG.media.fitting,
    },
  };
}

export async function readSiteConfig(): Promise<SiteConfig> {
  const token = import.meta.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return DEFAULT_CONFIG;

  try {
    const result = await list({ prefix: CONFIG_PATH, limit: 10, token });
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
  const token = import.meta.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_NOT_CONFIGURED');
  }

  const config = normalizeConfig(input);
  await put(CONFIG_PATH, JSON.stringify(config), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
    token,
  });

  return config;
}

export function validateAdminPassword(password: string | null | undefined) {
  const configured = import.meta.env.ADMIN_PASSWORD;
  if (!configured) {
    return { ok: false as const, status: 503, error: 'ADMIN_PASSWORD_NOT_CONFIGURED' };
  }
  if (!password || password !== configured) {
    return { ok: false as const, status: 401, error: 'INVALID_PASSWORD' };
  }
  return { ok: true as const };
}
