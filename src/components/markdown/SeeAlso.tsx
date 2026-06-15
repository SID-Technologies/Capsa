import type { ReactNode } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Bookmarks } from '@phosphor-icons/react';

// In-content "See also" card for related-doc discovery. Authoring:
//
//   <SeeAlso>
//   - [Authentication](/docs/platform-core/auth-architecture)
//   - [Webhooks](/docs/platform-core/webhook-service)
//   </SeeAlso>
//
// Children are a normal Markdown list of links — rendered through the usual
// component map, wrapped in a titled card.
export default function SeeAlso({ title = 'See also', children }: { title?: string; children?: ReactNode }) {
  return (
    <YStack
      marginVertical="$4"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$lg"
      backgroundColor="$color2"
      paddingHorizontal="$4"
      paddingVertical="$3"
      gap="$1"
    >
      <XStack alignItems="center" gap="$2" marginBottom="$1">
        <Bookmarks size={15} color="var(--accent)" />
        <Text fontSize={12} fontWeight="700" textTransform="uppercase" letterSpacing={0.4} color="$color11">
          {title}
        </Text>
      </XStack>
      {children}
    </YStack>
  );
}
