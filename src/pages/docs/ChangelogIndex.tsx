import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { YStack, H1, H3, Paragraph, Text } from 'tamagui';

import { useDocsList } from '../../hooks/useDocs';
import { anchorNavProps } from '../../lib/navLink';
import { formatDate } from '../../lib/markdown';
import { SITE_NAME } from '../../lib/site';

// Newest-first listing of content/changelog/ entries. Entries themselves are
// ordinary docs (rendered by DocPage via the * splat); this page just lists
// them by their `date` frontmatter.
export default function ChangelogIndex() {
  const { docs } = useDocsList();
  const navigate = useNavigate();

  const entries = docs
    .filter((d) => d.category === 'changelog')
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  return (
    <YStack flex={1} padding="$6" paddingTop="$4" overflow="scroll" alignItems="center">
      <Helmet>
        <title>{`Changelog — ${SITE_NAME}`}</title>
      </Helmet>
      <YStack width="100%" maxWidth={760} gap="$5">
        <YStack gap="$2">
          <H1 fontWeight="700">Changelog</H1>
          <Paragraph size="$5" color="$colorPress">
            Release notes and updates for {SITE_NAME}.
          </Paragraph>
        </YStack>

        <YStack gap="$4">
          {entries.map((entry) => (
            <YStack
              key={entry.slug}
              {...anchorNavProps(`/docs/${entry.slug}`, () => navigate(`/docs/${entry.slug}`))}
              padding="$4"
              gap="$1.5"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$lg"
              cursor="pointer"
              hoverStyle={{ borderColor: '$accentBorder' }}
            >
              {entry.date && (
                <Text fontSize={12} color="$colorPress">
                  {formatDate(entry.date)}
                </Text>
              )}
              <H3 fontWeight="600" fontSize={18}>
                {entry.title}
              </H3>
              {entry.description && (
                <Paragraph size="$4" color="$color11">
                  {entry.description}
                </Paragraph>
              )}
            </YStack>
          ))}
          {entries.length === 0 && (
            <Paragraph color="$colorPress">
              No entries yet. Add dated MDX files under <code>content/changelog/</code>.
            </Paragraph>
          )}
        </YStack>
      </YStack>
    </YStack>
  );
}
