import { list, put } from '@vercel/blob';

export type FitMode = 'cover' | 'contain';
export type TextAlign = 'left' | 'center' | 'right';

export interface MediaAsset {
  url: string;
  positionX: number;
  positionY: number;
  zoom: number;
  fit: FitMode;
}

export interface TextBlock {
  text: string;
  font: string;
  size: number;
  x: number;
  y: number;
  color: string;
  weight: number;
  italic: boolean;
  align: TextAlign;
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
  texts: Record<string, TextBlock>;
}

const asset = (url: string, fit: FitMode = 'cover'): MediaAsset => ({
  url, positionX: 50, positionY: 50, zoom: 100, fit,
});

const text = (
  value: string, font: string, size: number, color: string,
  weight = 400, italic = false, align: TextAlign = 'center',
): TextBlock => ({
  text: value, font, size, x: 0, y: 0, color, weight, italic, align,
});

export const DEFAULT_TEXTS: Record<string, TextBlock> = {
  heroKicker: text('UGC Creator • Moda • Beleza • Lifestyle', 'Segoe UI', 12, '#d88c88', 700),
  heroTitle: text('Letícia Leite', 'Georgia', 64, '#9c3f3f', 700),
  heroDescription: text('Conteúdo autêntico, estético e pensado para aproximar marcas de pessoas.', 'Segoe UI', 17, '#746d69'),
  heroButtonPortfolio: text('Ver portfólio', 'Segoe UI', 14, '#2f2b2a', 600),
  heroButtonPackages: text('Pacotes & serviços', 'Segoe UI', 14, '#2f2b2a', 600),
  heroButtonContact: text('Falar comigo', 'Segoe UI', 14, '#ffffff', 700),

  portfolioEyebrow: text('Portfólio', 'Segoe UI', 12, '#d88c88', 700),
  portfolioTitle: text('Conteúdo em destaque', 'Georgia', 42, '#9c3f3f', 700, true),
  portfolioSubtitle: text('Três formatos para apresentar produto, experiência e resultado de forma natural.', 'Segoe UI', 16, '#746d69'),
  productType: text('Foto', 'Segoe UI', 11, '#d88c88', 700, false, 'left'),
  productLabel: text('Foto do produto', 'Georgia', 21, '#2f2b2a', 700, false, 'left'),
  unboxingType: text('Vídeo', 'Segoe UI', 11, '#d88c88', 700, false, 'left'),
  unboxingLabel: text('Vídeo de unboxing', 'Georgia', 21, '#2f2b2a', 700, false, 'left'),
  fittingType: text('Foto', 'Segoe UI', 11, '#d88c88', 700, false, 'left'),
  fittingLabel: text('Foto provador', 'Georgia', 21, '#2f2b2a', 700, false, 'left'),

  servicesEyebrow: text('Pacotes & serviços', 'Segoe UI', 12, '#d88c88', 700),
  servicesTitle: text('Escolha o formato ideal', 'Georgia', 42, '#9c3f3f', 700, true),
  servicesSubtitle: text('Opções para ações pontuais, presença recorrente e campanhas UGC personalizadas.', 'Segoe UI', 16, '#746d69'),

  basicName: text('Plano Básico', 'Segoe UI', 12, '#d88c88', 800, false, 'left'),
  basicHighlight: text('Provador avulso', 'Georgia', 27, '#2f2b2a', 700, false, 'left'),
  basicDescription: text('Ideal para apresentar peças de forma natural, visual e direta.', 'Segoe UI', 14, '#746d69', 400, false, 'left'),
  basicPrice: text('A partir de R$ 200,00', 'Georgia', 21, '#9c3f3f', 700, false, 'left'),

  monthlyName: text('Plano Mensal', 'Segoe UI', 12, '#d88c88', 800, false, 'left'),
  monthlyHighlight: text('Conteúdo recorrente', 'Georgia', 27, '#2f2b2a', 700, false, 'left'),
  monthlyDescription: text('1 provador por semana + 1 foto de look por semana.', 'Segoe UI', 14, '#746d69', 400, false, 'left'),
  monthlyPrice: text('A partir de R$ 900,00', 'Georgia', 21, '#9c3f3f', 700, false, 'left'),

  ugcName: text('Plano UGC', 'Segoe UI', 12, '#d88c88', 800, false, 'left'),
  ugcHighlight: text('Projeto personalizado', 'Georgia', 27, '#2f2b2a', 700, false, 'left'),
  ugcDescription: text('Formato, roteiro e entregas definidos de acordo com a necessidade da marca.', 'Segoe UI', 14, '#746d69', 400, false, 'left'),
  ugcPrice: text('Sob consulta', 'Georgia', 21, '#9c3f3f', 700, false, 'left'),
  proposalButton: text('Solicitar proposta', 'Segoe UI', 14, '#ffffff', 700),

  footerTitle: text('Vamos trabalhar juntos?', 'Georgia', 36, '#ffffff', 700, true),
  footerDescription: text('Um conteúdo feito para conectar. Criar é mais do que mostrar. É despertar interesse, identificação e desejo.', 'Segoe UI', 18, '#aaaaaa'),
  footerEmail: text('leticialeitecontent@gmail.com', 'Georgia', 24, '#ffffff'),
  footerLocation: text('Ribeirão Preto (SP) / Sete Lagoas (MG)', 'Segoe UI', 16, '#aaaaaa'),
  footerInstagram: text('@leticiafnda', 'Segoe UI', 14, '#ffffff'),
  footerWhatsapp: text('WhatsApp', 'Segoe UI', 14, '#ffffff'),
};

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
  texts: DEFAULT_TEXTS,
};

const CONFIG_PATH = 'portfolio-leticia/config.json';

function numberInRange(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeAsset(input: unknown, fallback: MediaAsset): MediaAsset {
  if (typeof input === 'string') return { ...fallback, url: input || fallback.url };
  const value = (input && typeof input === 'object' ? input : {}) as Partial<MediaAsset>;
  return {
    url: typeof value.url === 'string' && value.url ? value.url : fallback.url,
    positionX: numberInRange(value.positionX, fallback.positionX, 0, 100),
    positionY: numberInRange(value.positionY, fallback.positionY, 0, 100),
    zoom: numberInRange(value.zoom, fallback.zoom, 70, 220),
    fit: value.fit === 'contain' ? 'contain' : 'cover',
  };
}

function normalizeTextBlock(input: unknown, fallback: TextBlock): TextBlock {
  const value = (input && typeof input === 'object' ? input : {}) as Partial<TextBlock>;
  const weight = numberInRange(value.weight, fallback.weight, 100, 900);
  return {
    text: typeof value.text === 'string' ? value.text.slice(0, 1000) : fallback.text,
    font: typeof value.font === 'string' && value.font ? value.font.slice(0, 80) : fallback.font,
    size: numberInRange(value.size, fallback.size, 8, 100),
    x: numberInRange(value.x, fallback.x, -250, 250),
    y: numberInRange(value.y, fallback.y, -250, 250),
    color: typeof value.color === 'string' && value.color ? value.color.slice(0, 32) : fallback.color,
    weight: Math.round(weight / 100) * 100,
    italic: typeof value.italic === 'boolean' ? value.italic : fallback.italic,
    align: value.align === 'left' || value.align === 'right' ? value.align : 'center',
  };
}

export function normalizeConfig(input: Partial<SiteConfig> | null | undefined): SiteConfig {
  const bg = input?.background ?? {};
  const media = input?.media ?? {};
  const rawTexts = input?.texts ?? {};
  const texts: Record<string, TextBlock> = {};

  for (const [key, fallback] of Object.entries(DEFAULT_TEXTS)) {
    texts[key] = normalizeTextBlock((rawTexts as Record<string, unknown>)[key], fallback);
  }

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
    texts,
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
