// remark plugin: parse a fenced-code meta string like ```go title="main.go"
// and stash the filename as hProperties['data-title'] on the code node.
// mdast-util-to-hast applies those hProperties to the resulting <pre>, where
// CodeBlock reads them. Dependency-free (no unist-util-visit).

interface MdNode {
  type: string;
  meta?: string | null;
  data?: { hProperties?: Record<string, unknown> };
  children?: MdNode[];
}

function walk(node: MdNode, fn: (n: MdNode) => void): void {
  fn(node);
  if (node.children) for (const child of node.children) walk(child, fn);
}

export default function remarkCodeTitle() {
  return (tree: MdNode) => {
    walk(tree, (node) => {
      if (node.type !== 'code' || typeof node.meta !== 'string') return;
      const match = node.meta.match(/title="([^"]+)"/);
      if (!match) return;
      node.data = node.data ?? {};
      node.data.hProperties = { ...(node.data.hProperties ?? {}), 'data-title': match[1] };
    });
  };
}
