# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report privately via GitHub's [Security Advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
("Report a vulnerability" on the repository's **Security** tab), or email the
maintainers at **security@example.com**.

Include the affected version, a description, and steps to reproduce. We'll
acknowledge within a few business days and keep you updated on the fix.

## Scope

Capsa is a static site generator for documentation. Keep in mind:

- **`VITE_*` environment variables are public** — they're inlined into the
  client bundle at build time. Never place secrets in them. This is by design,
  not a vulnerability.
- The optional auth integration uses a public WorkOS client id; any real secrets
  belong in a server/Function you control, not in the client.

Reports about secrets intentionally exposed through `VITE_*` variables are out of
scope.
