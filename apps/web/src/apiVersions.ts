// API reference versions. Each maps a label to an OpenAPI spec served from
// public/openapi/. With one entry there's no switcher; add a second and the
// reference page grows a version dropdown automatically. Point these at your
// own spec(s) — or have CI drop them at public/openapi/<version>.yaml.

export interface ApiVersion {
  label: string;
  url: string;
}

export const apiVersions: ApiVersion[] = [
  { label: 'v1.0', url: '/openapi/v1.yaml' },
  // { label: 'v2.0', url: '/openapi/v2.yaml' },
];
