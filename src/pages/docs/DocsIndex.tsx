import { useNavigate } from 'react-router-dom';
import { YStack, H1, H3, Paragraph, XStack } from 'tamagui';

import { useDocsList } from '../../hooks/useDocs';
import { SITE_NAME } from '../../lib/site';

export default function DocsIndex() {
  const { navTree } = useDocsList();
  const navigate = useNavigate();

  return (
    <YStack flex={1} padding="$6" paddingTop="$4" gap="$6" overflow="scroll">
      <YStack gap="$2">
        <H1 fontWeight="700">{SITE_NAME} Documentation</H1>
        <Paragraph size="$5" color="$colorPress">
          Browse the docs below, or press ⌘K to search.
        </Paragraph>
      </YStack>

      <XStack flexWrap="wrap" gap="$4">
        {navTree.map((category) => (
          <YStack
            key={category.name}
            width={280}
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$lg"
            gap="$2"
            cursor="pointer"
            hoverStyle={{ backgroundColor: '$backgroundHover', borderColor: '$color' }}
            onPress={() => {
              if (category.items.length > 0) {
                navigate(`/docs/${category.items[0].slug}`);
              }
            }}
          >
            <H3 fontWeight="600">{category.label}</H3>
            <Paragraph size="$3" color="$colorPress">
              {category.items.length} {category.items.length === 1 ? 'doc' : 'docs'}
            </Paragraph>
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}
