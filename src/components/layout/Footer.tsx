import { XStack, Text } from 'tamagui';
import { GithubLogo, Pulse, Lifebuoy } from '@phosphor-icons/react';

import { SITE_NAME, GITHUB_URL } from '../../lib/site';

// Docs footer. GitHub always shows (defaults to the repo); Status/Support render
// only when their env var is set, so a bare deploy stays clean and lights up
// what it has. No fake "all systems operational" badge.
const LINKS = [
  { href: GITHUB_URL, label: 'GitHub', Icon: GithubLogo },
  { href: import.meta.env.VITE_STATUS_URL, label: 'Status', Icon: Pulse },
  { href: import.meta.env.VITE_SUPPORT_URL, label: 'Support', Icon: Lifebuoy },
].filter((l) => Boolean(l.href)) as { href: string; label: string; Icon: typeof GithubLogo }[];

const ORG = (import.meta.env.VITE_SITE_ORG as string | undefined) || SITE_NAME;

export default function Footer() {
  return (
    <XStack
      marginTop="$8"
      paddingTop="$5"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap="$3"
    >
      <Text fontSize={12} color="$colorPress">
        © {ORG}
      </Text>
      {LINKS.length > 0 && (
        <XStack gap="$4" alignItems="center" flexWrap="wrap">
          {LINKS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <XStack alignItems="center" gap="$1.5" opacity={0.75} hoverStyle={{ opacity: 1 }}>
                <Icon size={14} color="var(--colorPress)" />
                <Text fontSize={12} color="$color10">
                  {label}
                </Text>
              </XStack>
            </a>
          ))}
        </XStack>
      )}
    </XStack>
  );
}
