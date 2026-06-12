import { XStack, Paragraph } from 'tamagui';

// Inline API endpoint reference for use in prose/guides:
//   <ApiMethod method="POST" path="/v1/widgets" desc="Create a widget" />
// Links through to the full Scalar API reference at /docs/api.

const METHOD_COLORS: Record<string, string> = {
  GET: '#16a34a',
  POST: '#2563eb',
  PUT: '#d97706',
  PATCH: '#7c3aed',
  DELETE: '#dc2626',
};

interface ApiMethodProps {
  method?: string;
  path?: string;
  desc?: string;
  href?: string;
}

export default function ApiMethod({ method = 'GET', path = '/', desc, href = '/docs/api' }: ApiMethodProps) {
  const m = method.toUpperCase();
  const color = METHOD_COLORS[m] ?? '#6b7280';

  return (
    <a href={href} style={{ textDecoration: 'none' }}>
      <XStack
        alignItems="center"
        gap="$3"
        marginVertical="$2"
        paddingHorizontal="$3"
        paddingVertical="$2"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$backgroundHover"
        hoverStyle={{ borderColor: '$accentBorder' }}
        cursor="pointer"
      >
        <Paragraph
          fontFamily="$body"
          fontSize={11}
          fontWeight="700"
          color="#fff"
          backgroundColor={color}
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$sm"
          minWidth={52}
          textAlign="center"
        >
          {m}
        </Paragraph>
        <Paragraph fontFamily="'JetBrains Mono', monospace" fontSize={13} color="$color">
          {path}
        </Paragraph>
        {desc && (
          <Paragraph fontSize={13} color="$colorPress" marginLeft="auto">
            {desc}
          </Paragraph>
        )}
      </XStack>
    </a>
  );
}
