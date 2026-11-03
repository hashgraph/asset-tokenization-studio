// SPDX-License-Identifier: Apache-2.0

/**
 * Public Hedera mirror node hosts. Unless BLOCKCHAIN_MIRROR_NODE_ALLOWED_HOSTS is set, the listener may
 * only poll these hosts plus the host of BLOCKCHAIN_MIRROR_NODE_URL, so a runtime config change cannot
 * point the backend at an internal service or a server that feeds it forged Transfer events.
 */
export const DEFAULT_ALLOWED_MIRROR_NODE_HOSTS: readonly string[] = [
  "mainnet-public.mirrornode.hedera.com",
  "mainnet.mirrornode.hedera.com",
  "testnet.mirrornode.hedera.com",
  "previewnet.mirrornode.hedera.com",
];

const ALLOWED_PROTOCOLS = ["http:", "https:"];

/** Lower-cases a host name and drops trailing dots, so "LocalHost." and "localhost" compare equal. */
export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/\.+$/, "");
}

/**
 * Hosts the listener may poll: the explicit comma-separated allow-list when given, otherwise the public
 * Hedera mirror nodes; the host of the operator-configured default URL is always allowed.
 */
export function getAllowedMirrorNodeHosts(allowList: string | undefined, defaultMirrorNodeUrl?: string): string[] {
  const explicit = (allowList ?? "")
    .split(",")
    .map(normalizeHost)
    .filter((host) => host.length > 0);
  const hosts = new Set(explicit.length > 0 ? explicit : DEFAULT_ALLOWED_MIRROR_NODE_HOSTS.map(normalizeHost));
  const defaultHost = defaultMirrorNodeUrl ? tryParseUrl(defaultMirrorNodeUrl)?.hostname : undefined;
  if (defaultHost) hosts.add(normalizeHost(defaultHost));
  return [...hosts];
}

/**
 * Checks a mirror node base URL against the scheme and host allow-list.
 * Returns undefined when the URL is acceptable, otherwise a short reason that never echoes the URL.
 */
export function getMirrorNodeUrlViolation(url: string, allowedHosts: readonly string[]): string | undefined {
  const parsed = tryParseUrl(url);
  if (!parsed) return "mirrorNodeUrl is not a valid URL";
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) return "mirrorNodeUrl must use http or https";
  if (parsed.username || parsed.password) return "mirrorNodeUrl must not contain credentials";
  if (parsed.search || parsed.hash) return "mirrorNodeUrl must not contain a query string or fragment";
  if (!allowedHosts.includes(normalizeHost(parsed.hostname))) {
    return "mirrorNodeUrl host is not in the allowed mirror node hosts (BLOCKCHAIN_MIRROR_NODE_ALLOWED_HOSTS)";
  }
  return undefined;
}

/** Host part of a URL for log lines, or a placeholder when it cannot be parsed. Never logs paths or queries. */
export function mirrorNodeHostForLogs(url: string): string {
  return tryParseUrl(url)?.host ?? "<invalid url>";
}

function tryParseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}
