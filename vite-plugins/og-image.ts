import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Build-time OG card generation (1200×630 PNG per doc) — satori renders a
// flexbox object tree to SVG, resvg rasterizes it. Both are imported lazily so
// they only load during `vite build` (never on dev-server startup).

export interface OgCardInput {
  siteName: string;
  title: string;
  description: string;
  category?: string;
}

// Satori element tree (plain objects — no React needed in a build plugin).
type El = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: El[] | string): El => ({
  type,
  props: { style, children },
});

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

// Steel-dark brand card: graphite background, steel-blue accent bar,
// site name + category up top, big title, muted description.
function card({ siteName, title, description, category }: OgCardInput): El {
  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0b0d0f',
      padding: '72px 80px',
      fontFamily: 'Space Grotesk',
    },
    [
      el('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
        el('div', { width: 20, height: 20, backgroundColor: '#5b86bd', borderRadius: 6 }),
        el('div', { fontSize: 34, fontWeight: 700, color: '#f5f7fa' }, siteName),
        ...(category
          ? [
              el(
                'div',
                {
                  fontSize: 24,
                  color: '#79808b',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginLeft: 12,
                },
                category.replace(/-/g, ' '),
              ),
            ]
          : []),
      ]),
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1,
          gap: 28,
        },
        [
          el('div', { fontSize: 72, fontWeight: 700, color: '#f5f7fa', lineHeight: 1.15 }, clip(title, 70)),
          el('div', { fontSize: 30, color: '#9aa1ac', lineHeight: 1.45 }, clip(description, 140)),
        ],
      ),
      el('div', { display: 'flex', width: 220, height: 8, backgroundColor: '#5b86bd', borderRadius: 4 }),
    ],
  );
}

let fontsCache: { name: string; data: Buffer; weight: 400 | 700 }[] | null = null;
function loadFonts(root: string) {
  if (!fontsCache) {
    const dir = join(root, 'node_modules/@fontsource/space-grotesk/files');
    fontsCache = [
      {
        name: 'Space Grotesk',
        data: readFileSync(join(dir, 'space-grotesk-latin-400-normal.woff')),
        weight: 400,
      },
      {
        name: 'Space Grotesk',
        data: readFileSync(join(dir, 'space-grotesk-latin-700-normal.woff')),
        weight: 700,
      },
    ];
  }
  return fontsCache;
}

export async function generateOgImage(root: string, input: OgCardInput): Promise<Buffer> {
  const { default: satori } = await import('satori');
  const { Resvg } = await import('@resvg/resvg-js');

  const svg = await satori(card(input) as never, {
    width: 1200,
    height: 630,
    fonts: loadFonts(root).map((f) => ({ ...f, style: 'normal' as const })),
  });
  return new Resvg(svg).render().asPng() as Buffer;
}
