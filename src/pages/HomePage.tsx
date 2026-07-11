import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MDXProvider } from '@mdx-js/react';
import { YStack, Spinner } from 'tamagui';
import type { ReactNode } from 'react';

import TopNav from '../components/layout/TopNav';
import Footer from '../components/layout/Footer';
import { useDoc } from '../hooks/useDocs';
import { useNavigation } from '../hooks/useNavigation';
import mdxComponents from '../components/markdown/mdxComponents';
import { Hero, FeatureGrid, Feature, LinkButton } from '../components/markdown/landing';
import { SITE_NAME } from '../lib/site';

// Landing page, rendered at `/` when content/home.mdx exists (see App.tsx).
// Same chrome as the docs (TopNav tabs, Footer) but no sidebar, and a wider
// content column than the 800px article wrapper.
const homeComponents = {
  ...mdxComponents,
  wrapper: ({ children }: { children?: ReactNode }) => (
    <YStack gap="$3" width="100%" maxWidth={1100}>
      {children}
    </YStack>
  ),
  Hero,
  FeatureGrid,
  Feature,
  LinkButton,
};

export default function HomePage() {
  const navigate = useNavigate();
  const { doc } = useDoc('home');
  const nav = useNavigation(undefined, '/');

  const onTabSelect = (i: number) => {
    const tab = nav.tabs[i];
    if (!tab) return;
    if (tab.href) navigate(tab.href);
    else {
      const first = nav.firstPage(i);
      if (first) navigate(`/docs/${first}`);
    }
  };

  return (
    <YStack flex={1} height="100vh" overflow="hidden" backgroundColor="$background">
      <Helmet>
        <title>{SITE_NAME}</title>
      </Helmet>
      <TopNav tabs={nav.tabs} activeTab={-1} onTabSelect={onTabSelect} showMenu={false} />
      <YStack flex={1} overflow="scroll">
        <YStack alignItems="center" paddingHorizontal="$5" paddingBottom="$6">
          {doc ? (
            <MDXProvider components={homeComponents}>
              <doc.Component />
            </MDXProvider>
          ) : (
            <Spinner size="large" margin="$8" />
          )}
          <YStack width="100%" maxWidth={1100}>
            <Footer />
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
