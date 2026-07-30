// SPDX-License-Identifier: Apache-2.0

export const testnet = "testnet";
export const previewnet = "previewnet";
export const mainnet = "mainnet";
export const local = "local";
export const hashsphere = "hashsphere";
export const unrecognized = "unrecognized";

export type Environment = "testnet" | "previewnet" | "mainnet" | "local" | "hashsphere" | "unrecognized" | string;

const publicHederaNetworks = [
  {
    network: testnet,
    chainId: 296,
  },
  {
    network: previewnet,
    chainId: 297,
  },
  {
    network: mainnet,
    chainId: 295,
  },
  {
    network: local,
    chainId: 298,
  },
];

export const reservedChainIds = publicHederaNetworks.map(({ chainId }) => chainId);

export const hashsphereChainIdEnvVars = ["HASHSPHERE_CHAIN_ID", "REACT_APP_HASHSPHERE_CHAIN_ID"];

export const resolveHashsphereChainId = (env: Record<string, string | undefined>): number | undefined => {
  for (const key of hashsphereChainIdEnvVars) {
    const raw = env[key];
    if (raw === undefined || raw.trim() === "") continue;
    const chainId = Number(raw);
    if (!Number.isInteger(chainId) || chainId <= 0) continue;
    if (reservedChainIds.includes(chainId)) continue;
    return chainId;
  }
  return undefined;
};

const readEnv = (): Record<string, string | undefined> => {
  try {
    if (typeof process === "undefined" || !process.env) return {};
    return {
      HASHSPHERE_CHAIN_ID: process.env.HASHSPHERE_CHAIN_ID,
      REACT_APP_HASHSPHERE_CHAIN_ID: process.env.REACT_APP_HASHSPHERE_CHAIN_ID,
    };
  } catch {
    return {};
  }
};

const hashsphereChainId = resolveHashsphereChainId(readEnv());

export const HederaNetworks = [
  ...publicHederaNetworks,
  ...(hashsphereChainId === undefined ? [] : [{ network: hashsphere, chainId: hashsphereChainId }]),
];
