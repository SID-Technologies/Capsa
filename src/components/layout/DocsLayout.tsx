import { useState } from 'react';
import type { FC } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { XStack, YStack } from 'tamagui';

import { useNavigation } from '../../hooks/useNavigation';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const DocsLayout: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const slug = pathname.startsWith('/docs/') ? pathname.slice('/docs/'.length) : undefined;
  const nav = useNavigation(slug, pathname);

  const onTabSelect = (i: number) => {
    const tab = nav.tabs[i];
    if (!tab) return;
    if (tab.href) navigate(tab.href);
    else {
      const first = nav.firstPage(i);
      if (first) navigate(`/docs/${first}`);
    }
  };

  // Tabs that are just a link (e.g. the API reference, which has its own
  // sidebar) get no docs sidebar — ours would be empty.
  const activeTabDef = nav.tabs[nav.activeTab];
  const hasSidebar = Boolean(activeTabDef && !activeTabDef.href && activeTabDef.groups?.length);

  return (
    <YStack height="100vh" overflow="hidden" backgroundColor="$background">
      <TopNav
        onMenuPress={() => setMenuOpen(true)}
        showMenu={hasSidebar}
        tabs={nav.tabs}
        activeTab={nav.activeTab}
        onTabSelect={onTabSelect}
      />

      <XStack flex={1} minHeight={0}>
        {/* Desktop/tablet sidebar (≥ md) — only when the tab has nav groups. */}
        {hasSidebar && (
          <YStack display="none" $md={{ display: 'flex' }} height="100%">
            <Sidebar groups={nav.groups} />
          </YStack>
        )}

        <YStack flex={1} minWidth={0} height="100%">
          <Outlet />
        </YStack>
      </XStack>

      {/* Mobile drawer (< md). */}
      {hasSidebar && (
        <>
          <div
            className={`sid-drawer-overlay${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className={`sid-drawer-panel${menuOpen ? ' open' : ''}`} role="dialog" aria-label="Navigation">
            <Sidebar groups={nav.groups} fullWidth onNavigate={() => setMenuOpen(false)} />
          </div>
        </>
      )}
    </YStack>
  );
};

export default DocsLayout;
