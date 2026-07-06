import { config } from './tamagui.config';

// Tamagui's runtime CSS defines the palette variables (--color1…12, etc.) for
// style themes, but NOT the semantic tokens from `extra` (--accent, --sidebar,
// --radiusMd, …) — those exist only in the JS theme objects. Anything that
// consumes theme values via CSS variables (docs.css, the Scalar bridge, content
// portaled to <body>) would silently resolve the BASE light/dark values instead
// of the active style's. This emits one rule per style theme with the full
// variable set, scoped to the root theme class that themeController (and the
// index.html pre-hydration script) put on <html>.
//
// The class is doubled (.t_dark_steel.t_dark_steel) so these rules beat
// Tamagui's equal-specificity base rules regardless of style-tag order.
export function injectThemeVariables(): void {
  if (typeof document === 'undefined') return;

  const themes = config.themes as Record<string, Record<string, unknown>>;
  let css = '';
  for (const [name, theme] of Object.entries(themes)) {
    // Top-level style themes only (light_steel, dark_aurora, …) — component
    // sub-themes (dark_steel_Button) resolve through Tamagui itself.
    if (!/^(light|dark)_[a-z]+$/.test(name)) continue;
    const decls = Object.entries(theme)
      .map(([key, v]) => {
        const varName = (v as { name?: string })?.name || key;
        const val = (v as { val?: unknown })?.val ?? v;
        return `--${varName}:${String(val)};`;
      })
      .join('');
    const cls = `t_${name}`;
    css += `:root.${cls}.${cls}{${decls}}\n`;
  }

  const el = document.createElement('style');
  el.id = 'capsa-theme-vars';
  el.textContent = css;
  document.head.appendChild(el);
}
