import { useState } from 'react';
import { YStack, XStack, Text, Button, TextArea } from 'tamagui';
import { IconThumbUp, IconThumbDown, IconCheck } from '@tabler/icons-react';

import { track } from '../../lib/analytics';

// "Was this helpful?" — the single highest-signal docs-quality metric.
// Up/down fires a PostHog event; thumbs-down reveals an optional comment box
// whose text also rides an event. No backend required.
export default function DocFeedback({ slug }: { slug: string }) {
  const [choice, setChoice] = useState<null | 'up' | 'down'>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const vote = (helpful: boolean) => {
    setChoice(helpful ? 'up' : 'down');
    track('docs_feedback', { slug, helpful });
    if (helpful) setSubmitted(true);
  };

  const sendComment = () => {
    if (comment.trim()) track('docs_feedback_comment', { slug, comment: comment.trim() });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <XStack
        marginTop="$8"
        paddingTop="$5"
        borderTopWidth={1}
        borderTopColor="$borderColor"
        alignItems="center"
        gap="$2"
      >
        <IconCheck size={16} color="var(--green10)" />
        <Text fontSize={13} color="$color10">
          Thanks for the feedback.
        </Text>
      </XStack>
    );
  }

  return (
    <YStack marginTop="$8" paddingTop="$5" borderTopWidth={1} borderTopColor="$borderColor" gap="$3">
      <XStack alignItems="center" gap="$3">
        <Text fontSize={13} fontWeight="600" color="$color11">
          Was this page helpful?
        </Text>
        <XStack gap="$2">
          <Button
            size="$2"
            chromeless
            borderWidth={1}
            borderColor={choice === 'up' ? '$accent' : '$borderColor'}
            backgroundColor={choice === 'up' ? '$accentLight' : 'transparent'}
            icon={<IconThumbUp size={15} />}
            onPress={() => vote(true)}
            aria-label="Yes, helpful"
          />
          <Button
            size="$2"
            chromeless
            borderWidth={1}
            borderColor={choice === 'down' ? '$accent' : '$borderColor'}
            backgroundColor={choice === 'down' ? '$accentLight' : 'transparent'}
            icon={<IconThumbDown size={15} />}
            onPress={() => vote(false)}
            aria-label="No, not helpful"
          />
        </XStack>
      </XStack>

      {choice === 'down' && (
        <YStack gap="$2" maxWidth={520}>
          <TextArea
            size="$3"
            placeholder="What was missing or unclear? (optional)"
            value={comment}
            onChangeText={setComment}
            minHeight={72}
          />
          <XStack>
            <Button size="$2" theme="active" onPress={sendComment}>
              Send feedback
            </Button>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
