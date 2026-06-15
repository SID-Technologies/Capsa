import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { Helmet } from 'react-helmet-async';
import { XStack, YStack, Paragraph, Spinner, H1, Text } from 'tamagui';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

import { useDoc, useDocMeta } from '../../hooks/useDocs';
import { useNavigation } from '../../hooks/useNavigation';
import type { TocEntry } from '../../lib/markdown';
import mdxComponents from '../../components/markdown/mdxComponents';
import TableOfContents from '../../components/layout/TableOfContents';
import DocFeedback from '../../components/layout/DocFeedback';
import Footer from '../../components/layout/Footer';
import PageActions from '../../components/markdown/PageActions';
import { track } from '../../lib/analytics';
import { SITE_NAME } from '../../lib/site';

export default function DocPage() {
  const { '*': slug } = useParams();
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { doc, isLoading, error } = useDoc(slug);
  const meta = useDocMeta(slug);
  const { orderedPages } = useNavigation(slug, pathname);

  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<TocEntry[]>([]);

  useLayoutEffect(() => {
    const root = contentRef.current;
    if (!root || !doc) {
      setHeadings([]);
      return;
    }
    const nodes = root.querySelectorAll<HTMLElement>('h2[id], h3[id]');
    setHeadings(
      Array.from(nodes).map((el) => ({
        id: el.id,
        text: el.textContent ?? '',
        level: Number(el.tagName.slice(1)),
      })),
    );
  }, [doc]);

  useLayoutEffect(() => {
    if (!doc || !hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const raf = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(raf);
  }, [doc, hash]);

  useEffect(() => {
    if (error && slug) track('docs_404', { slug });
  }, [error, slug]);

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8">
        <Spinner size="large" />
      </YStack>
    );
  }

  if (error || !doc) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8" gap="$3">
        <H1 fontSize="$9">404</H1>
        <Paragraph color="$colorPress">{error || 'Document not found'}</Paragraph>
      </YStack>
    );
  }

  const idx = orderedPages.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? orderedPages[idx - 1] : undefined;
  const next = idx >= 0 && idx < orderedPages.length - 1 ? orderedPages[idx + 1] : undefined;

  return (
    <XStack flex={1} height="100%" minHeight={0}>
      <Helmet>
        <title>{`${doc.title} — ${SITE_NAME}`}</title>
        {meta?.description && <meta name="description" content={meta.description} />}
        <meta property="og:title" content={doc.title} />
        {meta?.description && <meta property="og:description" content={meta.description} />}
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Middle column — the ONLY thing that scrolls. */}
      <YStack className="sid-doc-content" flex={1} height="100%" minWidth={0} overflow="scroll">
        <XStack justifyContent="center" paddingHorizontal="$5">
          {/* Centered reading column */}
          <YStack flex={1} maxWidth={768} paddingVertical="$7" paddingHorizontal="$3" minWidth={0}>
            {/* Breadcrumb + page actions */}
            <XStack alignItems="center" gap="$2" marginBottom="$4" flexWrap="wrap" rowGap="$2">
              <Text fontSize={12} color="$colorPress" textTransform="capitalize">
                {doc.category.replace(/-/g, ' ')}
              </Text>
              <Text fontSize={12} color="$colorPress">
                /
              </Text>
              <Text fontSize={12} color="$color11" fontWeight="500">
                {doc.title}
              </Text>
              <XStack marginLeft="auto">
                <PageActions slug={slug ?? ''} />
              </XStack>
            </XStack>

            <div ref={contentRef}>
              <MDXProvider components={mdxComponents}>
                <doc.Component />
              </MDXProvider>
            </div>

            {/* Was this helpful? */}
            <DocFeedback slug={slug ?? ''} />

            {/* Prev / next */}
            {(prev || next) && (
              <XStack marginTop="$6" gap="$3" flexWrap="wrap">
                {prev ? (
                  <YStack
                    flex={1}
                    minWidth={200}
                    borderWidth={1}
                    borderColor="$borderColor"
                    borderRadius="$lg"
                    padding="$3"
                    cursor="pointer"
                    hoverStyle={{ borderColor: '$accentBorder' }}
                    onPress={() => navigate(`/docs/${prev.slug}`)}
                  >
                    <XStack alignItems="center" gap="$1.5">
                      <ArrowLeft size={13} />
                      <Text fontSize={11} color="$colorPress">
                        Previous
                      </Text>
                    </XStack>
                    <Text fontSize={14} fontWeight="600" color="$color12" marginTop="$1">
                      {prev.title}
                    </Text>
                  </YStack>
                ) : (
                  <YStack flex={1} minWidth={200} />
                )}
                {next && (
                  <YStack
                    flex={1}
                    minWidth={200}
                    borderWidth={1}
                    borderColor="$borderColor"
                    borderRadius="$lg"
                    padding="$3"
                    cursor="pointer"
                    alignItems="flex-end"
                    hoverStyle={{ borderColor: '$accentBorder' }}
                    onPress={() => navigate(`/docs/${next.slug}`)}
                  >
                    <XStack alignItems="center" gap="$1.5">
                      <Text fontSize={11} color="$colorPress">
                        Next
                      </Text>
                      <ArrowRight size={13} />
                    </XStack>
                    <Text fontSize={14} fontWeight="600" color="$color12" marginTop="$1">
                      {next.title}
                    </Text>
                  </YStack>
                )}
              </XStack>
            )}

            <Footer />
          </YStack>
        </XStack>
      </YStack>

      {/* Right TOC column — OUTSIDE the scroll area, so it stays put while the
          middle column scrolls. Its own overflow handles very long TOCs. */}
      <YStack
        className="sid-toc-col"
        width={256}
        height="100%"
        flexShrink={0}
        display="none"
        $lg={{ display: 'flex' }}
      >
        <TableOfContents headings={headings} />
      </YStack>
    </XStack>
  );
}
