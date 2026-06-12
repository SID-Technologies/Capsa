// remark plugin: turn container directives (:::note / :::tip / :::warning /
// :::danger / :::info) into a <callout kind="..."> element that MDXProvider
// maps to the Callout component. Runs AFTER remark-directive (which parses the
// ::: syntax into containerDirective nodes). Dependency-free.

const KINDS = new Set(['note', 'info', 'tip', 'warning', 'danger']);

interface MdNode {
  type: string;
  name?: string;
  data?: { hName?: string; hProperties?: Record<string, unknown>; directiveLabel?: boolean };
  children?: MdNode[];
}

function walk(node: MdNode, fn: (n: MdNode) => void): void {
  fn(node);
  if (node.children) for (const child of node.children) walk(child, fn);
}

export default function remarkDirectiveCallouts() {
  return (tree: MdNode) => {
    walk(tree, (node) => {
      if (node.type !== 'containerDirective' || !node.name || !KINDS.has(node.name)) return;

      // An optional label — :::warning[Heads up] — becomes the title.
      let title: string | undefined;
      const first = node.children?.[0];
      if (first?.data?.directiveLabel) {
        title = (first.children ?? []).map((c) => (c as unknown as { value?: string }).value ?? '').join('');
        node.children = node.children!.slice(1);
      }

      node.data = node.data ?? {};
      node.data.hName = 'callout';
      node.data.hProperties = { kind: node.name, ...(title ? { title } : {}) };
    });
  };
}
