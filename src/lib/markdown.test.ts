import { describe, it, expect } from 'vitest';

import { formatDate, titleFromFilename } from './markdown';

describe('formatDate', () => {
  it('formats an ISO date as "Mon D, YYYY"', () => {
    expect(formatDate('2026-07-10')).toBe('Jul 10, 2026');
    expect(formatDate('2026-12-31')).toBe('Dec 31, 2026');
  });

  it('strips leading zeros from the day', () => {
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
    expect(formatDate('2026-03-09')).toBe('Mar 9, 2026');
  });

  it('accepts a full ISO datetime and uses only the date part', () => {
    // pubDate strings / frontmatter with time components still format cleanly.
    expect(formatDate('2026-07-10T00:00:00Z')).toBe('Jul 10, 2026');
  });

  it('is timezone-independent by construction (no Date parsing)', () => {
    // The whole reason this helper exists: a day-boundary date must render the
    // same string on every client so prerendered HTML matches after hydration.
    // Because it never constructs a Date, the result cannot shift by timezone.
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
  });

  it('returns the input unchanged when it is not an ISO date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
    expect(formatDate('')).toBe('');
  });
});

describe('titleFromFilename', () => {
  it('title-cases dash- and underscore-separated names', () => {
    expect(titleFromFilename('auth-billing-flow')).toBe('Auth Billing Flow');
    expect(titleFromFilename('api_reference')).toBe('Api Reference');
    expect(titleFromFilename('getting-started')).toBe('Getting Started');
  });

  it('capitalizes a single word', () => {
    expect(titleFromFilename('quickstart')).toBe('Quickstart');
  });

  it('strips a trailing .md extension', () => {
    expect(titleFromFilename('auth-billing-flow.md')).toBe('Auth Billing Flow');
  });
});
