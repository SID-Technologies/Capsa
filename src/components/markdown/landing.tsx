import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { YStack, XStack, H1, H3, Paragraph, Text } from 'tamagui';

import { NavIcon } from '../../lib/navIcons';
import { anchorNavProps } from '../../lib/navLink';

// Landing-page authoring components, available in content/home.mdx (merged
// into the MDX map by HomePage). Cards follow the SeeAlso/DocsIndex idiom.

export const Hero: FC<{ title: string; tagline?: string; children?: ReactNode }> = ({
  title,
  tagline,
  children,
}) => (
  <YStack alignItems="center" gap="$4" paddingTop="$10" paddingBottom="$8">
    <H1 fontWeight="700" fontSize={52} lineHeight={60} textAlign="center" maxWidth={780}>
      {title}
    </H1>
    {tagline && (
      <Paragraph size="$6" color="$colorPress" textAlign="center" maxWidth={640}>
        {tagline}
      </Paragraph>
    )}
    {children && (
      <XStack gap="$3" marginTop="$2" flexWrap="wrap" justifyContent="center">
        {children}
      </XStack>
    )}
  </YStack>
);

export const LinkButton: FC<{
  href: string;
  variant?: 'accent' | 'outline';
  children?: ReactNode;
}> = ({ href, variant = 'outline', children }) => {
  const navigate = useNavigate();
  const internal = href.startsWith('/');
  const accent = variant === 'accent';
  const linkProps = internal
    ? anchorNavProps(href, () => navigate(href))
    : ({ tag: 'a', href, className: 'sid-nav-link', target: '_blank', rel: 'noopener noreferrer' } as const);
  return (
    <XStack
      {...linkProps}
      alignItems="center"
      height={44}
      paddingHorizontal="$5"
      borderRadius="$lg"
      borderWidth={1}
      borderColor={accent ? '$accent' : '$borderColor'}
      backgroundColor={accent ? '$accent' : 'transparent'}
      cursor="pointer"
      hoverStyle={accent ? { backgroundColor: '$accentDark' } : { borderColor: '$accentBorder' }}
    >
      <Text fontSize={15} fontWeight="600" color={accent ? '$accentForeground' : '$color12'}>
        {children}
      </Text>
    </XStack>
  );
};

export const FeatureGrid: FC<{ children?: ReactNode }> = ({ children }) => (
  <XStack flexWrap="wrap" gap="$4" justifyContent="center" paddingVertical="$4">
    {children}
  </XStack>
);

export const Feature: FC<{ icon?: string; title: string; children?: ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <YStack
    flexBasis={320}
    flexGrow={1}
    maxWidth={380}
    padding="$4"
    gap="$2"
    borderWidth={1}
    borderColor="$borderColor"
    borderRadius="$lg"
    backgroundColor="$color2"
  >
    <XStack alignItems="center" gap="$2">
      {icon && <NavIcon name={icon} size={18} color="var(--accent)" />}
      <H3 fontWeight="600" fontSize={17}>
        {title}
      </H3>
    </XStack>
    <YStack gap="$2">{children}</YStack>
  </YStack>
);
