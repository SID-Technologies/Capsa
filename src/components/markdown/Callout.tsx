import type { ReactNode } from 'react';
import { YStack, XStack, Paragraph, useTheme } from 'tamagui';
import { IconInfoCircle, IconBulb, IconAlertTriangle, IconFlame } from '@tabler/icons-react';

// Admonition block rendered from :::note / :::tip / :::warning / :::danger.
// Colors come from the theme's existing semantic tokens (info/success/
// warning/error families in packages/configs/themes.ts) so callouts re-theme
// automatically per product and in light/dark.

type Kind = 'note' | 'info' | 'tip' | 'warning' | 'danger';

const CONFIG: Record<
  Kind,
  {
    label: string;
    Icon: typeof IconInfoCircle;
    accent: string;
    bg: string;
    fg: string;
    border: string;
  }
> = {
  note: {
    label: 'Note',
    Icon: IconInfoCircle,
    accent: '$info',
    bg: '$infoLight',
    fg: '$infoLightForeground',
    border: '$infoBorder',
  },
  info: {
    label: 'Info',
    Icon: IconInfoCircle,
    accent: '$info',
    bg: '$infoLight',
    fg: '$infoLightForeground',
    border: '$infoBorder',
  },
  tip: {
    label: 'Tip',
    Icon: IconBulb,
    accent: '$success',
    bg: '$successLight',
    fg: '$successLightForeground',
    border: '$successBorder',
  },
  warning: {
    label: 'Warning',
    Icon: IconAlertTriangle,
    accent: '$warning',
    bg: '$warningLight',
    fg: '$warningLightForeground',
    border: '$warningBorder',
  },
  danger: {
    label: 'Danger',
    Icon: IconFlame,
    accent: '$error',
    bg: '$errorLight',
    fg: '$errorLightForeground',
    border: '$errorBorder',
  },
};

interface CalloutProps {
  kind?: Kind;
  title?: string;
  children?: ReactNode;
}

export default function Callout({ kind = 'note', title, children }: CalloutProps) {
  const cfg = CONFIG[kind] ?? CONFIG.note;
  const { Icon, label } = cfg;
  const theme = useTheme();
  // Resolve the foreground token to a CSS value so the SVG icon can be tinted
  // (Tabler icons take a CSS color, not a Tamagui token).
  const iconColor = theme[cfg.fg.slice(1) as keyof typeof theme]?.get?.() as string | undefined;

  return (
    <YStack
      marginVertical="$3"
      borderRadius="$md"
      borderWidth={1}
      borderColor={cfg.border}
      borderLeftWidth={3}
      borderLeftColor={cfg.accent}
      backgroundColor={cfg.bg}
      paddingHorizontal="$4"
      paddingVertical="$3"
      gap="$1"
    >
      <XStack alignItems="center" gap="$2">
        <Icon size={16} color={iconColor} />
        <Paragraph
          fontWeight="700"
          fontSize="$3"
          color={cfg.fg}
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          {title ?? label}
        </Paragraph>
      </XStack>
      <YStack>{children}</YStack>
    </YStack>
  );
}
