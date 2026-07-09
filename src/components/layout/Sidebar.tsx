import { useState, useSyncExternalStore } from 'react';
import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { YStack, XStack, ScrollView, Text } from 'tamagui';
import { MagnifyingGlass, CaretRight } from '@phosphor-icons/react';

import type { ResolvedGroup, ResolvedItem } from '../../hooks/useNavigation';
import { normalizeSlug } from '../../hooks/useDocs';
import { anchorNavProps } from '../../lib/navLink';
import { NavIcon } from '../../lib/navIcons';
import { useCommandPalette } from './CommandPalette';

interface SidebarProps {
  groups: ResolvedGroup[];
  fullWidth?: boolean;
  onNavigate?: () => void;
}

// Two-pass platform detection: the server (prerender) and first client render
// both say false ("Ctrl K"), then Macs flip to "⌘ K" — a module-scope
// navigator read would make the prerendered HTML mismatch Mac hydration.
const noopSubscribe = () => () => {};
const useIsMac = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => /Mac/i.test(navigator.platform),
    () => false,
  );

const Sidebar: FC<SidebarProps> = ({ groups, fullWidth = false, onNavigate }) => {
  const navigate = useNavigate();
  const { '*': rawSlug } = useParams();
  const currentSlug = normalizeSlug(rawSlug);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { open: openPalette } = useCommandPalette();
  const isMac = useIsMac();

  const go = (slug: string, headingId?: string) => {
    navigate(`/docs/${slug}${headingId ? `#${headingId}` : ''}`);
    onNavigate?.();
  };

  // ── Page link ───────────────────────────────────────────────────────────
  const renderPage = (slug: string, title: string, depth: number) => {
    const active = currentSlug === slug;
    return (
      <XStack
        key={slug}
        {...anchorNavProps(`/docs/${slug}`, () => go(slug))}
        alignItems="center"
        paddingVertical="$1.5"
        paddingRight="$2"
        paddingLeft={10 + depth * 14}
        marginLeft={8}
        borderRadius="$md"
        cursor="pointer"
        borderLeftWidth={2}
        borderLeftColor={active ? '$accent' : 'transparent'}
        backgroundColor={active ? '$color4' : 'transparent'}
        hoverStyle={{ backgroundColor: active ? '$color4' : '$color3' }}
      >
        <Text fontSize={13.5} fontWeight={active ? '600' : '400'} color={active ? '$color12' : '$color10'}>
          {title}
        </Text>
      </XStack>
    );
  };

  // ── Group (collapsible) ─────────────────────────────────────────────────
  const renderGroup = (group: ResolvedGroup, depth: number, keyPrefix: string) => {
    const key = `${keyPrefix}/${group.group}`;
    const isCollapsed = collapsed.has(key) || (!group.expanded && !collapsed.has(`${key}:open`));
    return (
      <YStack key={key} marginBottom="$3">
        <XStack
          alignItems="center"
          gap="$2"
          paddingVertical="$1.5"
          paddingHorizontal="$2"
          cursor="pointer"
          onPress={() => {
            // Track explicit toggles so default-collapsed groups can be opened.
            setCollapsed((prev) => {
              const next = new Set(prev);
              const openKey = `${key}:open`;
              if (group.expanded) {
                next.has(key) ? next.delete(key) : next.add(key);
              } else {
                next.has(openKey) ? next.delete(openKey) : next.add(openKey);
              }
              return next;
            });
          }}
        >
          <NavIcon name={group.icon} size={15} />
          <Text
            fontSize={12}
            fontWeight="700"
            letterSpacing={0.3}
            textTransform="uppercase"
            color="$color11"
            flex={1}
          >
            {group.group}
          </Text>
          {group.tag && (
            <Text
              fontSize={9}
              fontWeight="700"
              letterSpacing={0.5}
              color="$accentForeground"
              backgroundColor="$accent"
              paddingHorizontal={6}
              paddingVertical={1}
              borderRadius="$sm"
            >
              {group.tag}
            </Text>
          )}
          <XStack rotate={isCollapsed ? '0deg' : '90deg'} opacity={0.5}>
            <CaretRight size={13} />
          </XStack>
        </XStack>

        {!isCollapsed && (
          <YStack gap={1} marginTop="$1">
            {group.items.map((item) => renderItem(item, depth + 1, key))}
          </YStack>
        )}
      </YStack>
    );
  };

  const renderItem = (item: ResolvedItem, depth: number, keyPrefix: string) =>
    item.type === 'page' ? renderPage(item.slug, item.title, depth) : renderGroup(item, depth, keyPrefix);

  return (
    <YStack
      className="sid-sidebar"
      width={fullWidth ? '100%' : 280}
      minWidth={fullWidth ? undefined : 280}
      height="100%"
      borderRightWidth={fullWidth ? 0 : 1}
      borderRightColor="$borderColor"
      backgroundColor="$background"
    >
      {/* Search opener — opens the ⌘K palette. */}
      <YStack padding="$3" paddingBottom="$2">
        <XStack
          alignItems="center"
          backgroundColor="$color3"
          borderRadius="$lg"
          height={36}
          paddingHorizontal="$3"
          gap="$2"
          borderWidth={1}
          borderColor="$borderColor"
          cursor="pointer"
          hoverStyle={{ borderColor: '$accentBorder' }}
          onPress={openPalette}
        >
          <MagnifyingGlass size={15} color="var(--colorPress)" />
          <Text flex={1} fontSize={13.5} color="$colorPress">
            Search
          </Text>
          {/* Mimics Scalar's search-shortcut chip (uppercase 12/500, 4×5px
              padding, 6px radius, transparent bg) so the two sidebars match. */}
          <Text
            fontSize={12}
            fontWeight="500"
            lineHeight={12}
            textTransform="uppercase"
            color="$color11"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$md"
            paddingHorizontal={5}
            paddingVertical={4}
          >
            {isMac ? '⌘ K' : 'Ctrl K'}
          </Text>
        </XStack>
      </YStack>

      <ScrollView flex={1} paddingBottom="$6" showsVerticalScrollIndicator={false}>
        <YStack paddingTop="$2">{groups.map((g) => renderGroup(g, 0, 'root'))}</YStack>
      </ScrollView>
    </YStack>
  );
};

export default Sidebar;
