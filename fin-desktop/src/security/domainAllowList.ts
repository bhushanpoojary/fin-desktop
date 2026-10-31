/**
 * Domain allow-list matching (content security).
 *
 * Decides whether an app may load/connect to a URL, using allow/deny host patterns with an
 * optional leading `*.` wildcard. Deny always wins; an empty allow-list means "no restriction
 * (unless denied)". Pure and unit-testable.
 */

export interface DomainAllowList {
  allow?: string[];
  deny?: string[];
}

/** Match a hostname against a pattern: `*` = any, `*.example.com` = example.com + subdomains. */
export function matchDomain(hostname: string, pattern: string): boolean {
  const host = hostname.toLowerCase();
  const pat = pattern.toLowerCase();
  if (pat === '*') return true;
  if (pat.startsWith('*.')) {
    const base = pat.slice(2);
    return host === base || host.endsWith(`.${base}`);
  }
  return host === pat;
}

/** Extract the lowercase hostname from a URL, or null if it is not parseable. */
export function parseHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Whether a URL is permitted by an allow/deny list (deny wins; empty allow = allow all). */
export function isUrlAllowed(url: string, list: DomainAllowList): boolean {
  const host = parseHost(url);
  if (!host) return false;
  if (list.deny?.some((pattern) => matchDomain(host, pattern))) return false;
  if (list.allow && list.allow.length > 0) {
    return list.allow.some((pattern) => matchDomain(host, pattern));
  }
  return true;
}
