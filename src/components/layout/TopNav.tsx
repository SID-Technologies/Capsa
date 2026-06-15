import { useState } from 'react';
import type { FC } from 'react';
import { XStack, YStack, Paragraph, Button, Text, Separator, Popover } from 'tamagui';
import { Sun, Moon, Desktop, SignOut, Gear, List, GithubLogo } from '@phosphor-icons/react';
import { useThemeController } from '@/theme/themeController';
import type { ThemeMode, ThemeStyle } from '@/theme/themeController';
import { PINNED_THEME_STYLE } from '@/theme/themeController';

import { useAuth } from '../../contexts/AuthContext';
import type { NavTab } from '../../navigation';
import { NavIcon } from '../../lib/navIcons';
import { SITE_NAME, GITHUB_URL } from '../../lib/site';
import { IS_PUBLIC } from '../../lib/auth';

const modeOptions: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Desktop },
];

const styleOptions: ThemeStyle[] = ['steel', 'aurora', 'retro', 'shadcn'];

const SITE_TITLE = SITE_NAME;

interface TopNavProps {
  onMenuPress?: () => void;
  showMenu?: boolean;
  tabs?: NavTab[];
  activeTab?: number;
  onTabSelect?: (index: number) => void;
}

const TopNav: FC<TopNavProps> = ({ onMenuPress, showMenu = true, tabs = [], activeTab = 0, onTabSelect }) => {
  const { logout } = useAuth();
  const { isDark, toggleTheme, themeMode, themeStyle, setThemeMode, setThemeStyle } = useThemeController();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <XStack
      className="sid-topbar"
      height={56}
      alignItems="center"
      paddingHorizontal="$4"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      backgroundColor="$background"
      gap="$3"
    >
      {/* Hamburger — mobile only (below md), and only when a sidebar exists. */}
      {showMenu && (
        <Button
          size="$2"
          circular
          chromeless
          display="flex"
          $md={{ display: 'none' }}
          onPress={onMenuPress}
          icon={<List size={18} />}
          aria-label="Open navigation"
        />
      )}

      {/* Brand */}
      <XStack alignItems="center" gap="$2" paddingRight="$2">
        <Paragraph fontWeight="800" fontSize="$6" letterSpacing={-0.3}>
          {SITE_TITLE}
        </Paragraph>
      </XStack>

      {/* Section tabs (desktop) */}
      <XStack alignItems="center" gap="$1" display="none" $md={{ display: 'flex' }}>
        {tabs.map((t, i) => {
          const active = i === activeTab;
          return (
            <XStack
              key={t.tab}
              alignItems="center"
              gap="$2"
              height={56}
              paddingHorizontal="$3"
              cursor="pointer"
              borderBottomWidth={2}
              borderBottomColor={active ? '$accent' : 'transparent'}
              onPress={() => onTabSelect?.(i)}
              hoverStyle={{ borderBottomColor: active ? '$accent' : '$borderColor' }}
            >
              <NavIcon name={t.icon} size={15} />
              <Text
                fontSize={14}
                fontWeight={active ? '600' : '500'}
                color={active ? '$color12' : '$color10'}
              >
                {t.tab}
              </Text>
            </XStack>
          );
        })}
      </XStack>

      {/* Right controls */}
      <XStack marginLeft="auto" alignItems="center" gap="$2">
        {GITHUB_URL && (
          <Button
            size="$2"
            circular
            chromeless
            onPress={() => window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')}
            icon={<GithubLogo size={16} />}
            aria-label="View source on GitHub"
          />
        )}

        <Button
          size="$2"
          circular
          chromeless
          onPress={toggleTheme}
          icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
        />

        <Popover open={settingsOpen} onOpenChange={setSettingsOpen} placement="bottom-end" offset={4}>
          <Popover.Trigger asChild>
            <Button size="$2" circular chromeless icon={<Gear size={16} />} />
          </Popover.Trigger>

          <Popover.Content
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={8}
            padding={0}
            backgroundColor="$background"
            elevation="$4"
            enterStyle={{ opacity: 0, y: -4 }}
            exitStyle={{ opacity: 0, y: -4 }}
            animation="quick"
          >
            <YStack width={280}>
              <YStack padding="$3" gap="$1">
                <Text fontSize={13} fontWeight="600" color="$color12">
                  Appearance
                </Text>
              </YStack>

              <Separator />

              <YStack padding="$3" gap="$2">
                <Text fontSize={12} fontWeight="500" color="$color10">
                  Mode
                </Text>
                <XStack gap={4}>
                  {modeOptions.map(({ value, label, Icon }) => (
                    <XStack
                      key={value}
                      paddingHorizontal={10}
                      paddingVertical={4}
                      borderRadius={4}
                      gap={6}
                      alignItems="center"
                      cursor="pointer"
                      backgroundColor={themeMode === value ? '$color4' : 'transparent'}
                      hoverStyle={{ backgroundColor: themeMode === value ? '$color4' : '$color3' }}
                      onPress={() => setThemeMode(value)}
                    >
                      <Icon size={13} />
                      <Text
                        fontSize={12}
                        fontWeight={themeMode === value ? '600' : '400'}
                        color={themeMode === value ? '$color12' : '$color10'}
                      >
                        {label}
                      </Text>
                    </XStack>
                  ))}
                </XStack>
              </YStack>

              {/* Hidden on pinned per-product deploys (VITE_DEFAULT_THEME_STYLE). */}
              {!PINNED_THEME_STYLE && <Separator />}
              {!PINNED_THEME_STYLE && (
                <YStack padding="$3" gap="$2">
                  <Text fontSize={12} fontWeight="500" color="$color10">
                    Style
                  </Text>
                  <XStack gap={4} flexWrap="wrap">
                    {styleOptions.map((style) => (
                      <XStack
                        key={style}
                        paddingHorizontal={10}
                        paddingVertical={4}
                        borderRadius={4}
                        cursor="pointer"
                        backgroundColor={themeStyle === style ? '$color4' : 'transparent'}
                        hoverStyle={{ backgroundColor: themeStyle === style ? '$color4' : '$color3' }}
                        onPress={() => setThemeStyle(style)}
                      >
                        <Text
                          fontSize={12}
                          textTransform="capitalize"
                          fontWeight={themeStyle === style ? '600' : '400'}
                          color={themeStyle === style ? '$color12' : '$color10'}
                        >
                          {style}
                        </Text>
                      </XStack>
                    ))}
                  </XStack>
                </YStack>
              )}
            </YStack>
          </Popover.Content>
        </Popover>

        {!IS_PUBLIC && <Button size="$2" circular chromeless onPress={logout} icon={<SignOut size={16} />} />}
      </XStack>
    </XStack>
  );
};

export default TopNav;
