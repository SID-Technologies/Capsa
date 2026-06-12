import type { ComponentType } from 'react';
import {
  IconPlayerPlay,
  IconServer,
  IconNotebook,
  IconCode,
  IconShieldLock,
  IconChartBar,
  IconRocket,
  IconSettings,
  IconFileText,
  IconBuilding,
  IconCoins,
  IconSearch,
  IconBook2,
  IconTerminal2,
  IconPlug,
  IconWebhook,
  IconKey,
  IconPencil,
  IconPointFilled,
} from '@tabler/icons-react';

// Mintlify-style icon names → Tabler icons. Used by the navigation config so
// groups/tabs can be labeled with a short string (icon: "play").
const ICONS: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  play: IconPlayerPlay,
  server: IconServer,
  notebook: IconNotebook,
  'notebook-text': IconNotebook,
  book: IconBook2,
  code: IconCode,
  shield: IconShieldLock,
  chart: IconChartBar,
  rocket: IconRocket,
  settings: IconSettings,
  file: IconFileText,
  building: IconBuilding,
  coins: IconCoins,
  search: IconSearch,
  terminal: IconTerminal2,
  plug: IconPlug,
  webhook: IconWebhook,
  key: IconKey,
  pencil: IconPencil,
};

export function NavIcon({ name, size = 16, color }: { name?: string; size?: number; color?: string }) {
  const Icon = (name && ICONS[name]) || IconPointFilled;
  return <Icon size={size} color={color} />;
}
