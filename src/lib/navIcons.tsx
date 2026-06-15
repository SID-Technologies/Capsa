import type { ComponentType } from 'react';
import {
  Play,
  HardDrives,
  Notebook,
  Code,
  ShieldCheck,
  ChartBar,
  Rocket,
  Gear,
  FileText,
  Buildings,
  Coins,
  MagnifyingGlass,
  BookOpen,
  Terminal,
  Plug,
  Plugs,
  Key,
  Pencil,
  Circle,
} from '@phosphor-icons/react';

// Mintlify-style icon names → Tabler icons. Used by the navigation config so
// groups/tabs can be labeled with a short string (icon: "play").
const ICONS: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  play: Play,
  server: HardDrives,
  notebook: Notebook,
  'notebook-text': Notebook,
  book: BookOpen,
  code: Code,
  shield: ShieldCheck,
  chart: ChartBar,
  rocket: Rocket,
  settings: Gear,
  file: FileText,
  building: Buildings,
  coins: Coins,
  search: MagnifyingGlass,
  terminal: Terminal,
  plug: Plug,
  webhook: Plugs,
  key: Key,
  pencil: Pencil,
};

export function NavIcon({ name, size = 16, color }: { name?: string; size?: number; color?: string }) {
  const Icon = (name && ICONS[name]) || Circle;
  return <Icon size={size} color={color} />;
}
