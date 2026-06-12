import { useState } from 'react';
import { ApiReferenceReact } from '@scalar/api-reference-react';
// Explicit stylesheet import — the component imports this internally, but doing
// it here guarantees Vite pulls Scalar's CSS into the lazy chunk.
import '@scalar/api-reference-react/style.css';

import { apiVersions } from '../apiVersions';

// API reference, rendered by Scalar from the versioned OpenAPI specs in
// public/openapi/ (see apiVersions.ts). Lazy-loaded in App.tsx so Scalar stays
// out of the main bundle.
//
// Try-it: Scalar's built-in API client is enabled by default — users can execute
// requests with a pasted key (Scalar persists it locally). To point it at a live
// sandbox, add a `servers` entry to the spec + enable CORS for the docs origin.
export default function ApiReference() {
  const [version, setVersion] = useState(apiVersions[0]);

  return (
    <div className="sid-scalar" style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
      {/* Version switcher — only shown once there's more than one version. */}
      {apiVersions.length > 1 && (
        <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 10 }}>
          <select
            value={version.url}
            onChange={(e) => setVersion(apiVersions.find((v) => v.url === e.target.value) ?? apiVersions[0])}
            style={{
              fontSize: 13,
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid var(--borderColor, #333)',
              background: 'var(--background, #fff)',
              color: 'var(--color, #111)',
            }}
          >
            {apiVersions.map((v) => (
              <option key={v.url} value={v.url}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <ApiReferenceReact
        key={version.url}
        configuration={{
          url: version.url,
          hideDarkModeToggle: true,
        }}
      />
    </div>
  );
}
