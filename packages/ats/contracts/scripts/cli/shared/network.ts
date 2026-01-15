#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Shared CLI utilities for network handling.
 * @module cli/shared/network
 */

import { Signer } from "ethers";
import { getAllNetworks, createNetworkSigner, info, error } from "@scripts/infrastructure";

/**
 * Result of requiring a network signer from environment.
 */
export interface NetworkSignerResult {
  network: string;
  signer: Signer;
  address: string;
}

/**
 * Parse and validate NETWORK environment variable, then create a signer.
 * Exits process with helpful error if validation fails.
 *
 * @returns Network name, signer, and deployer address
 */
export async function requireNetworkSigner(): Promise<NetworkSignerResult> {
  const network = process.env.NETWORK;

  if (!network) {
    error("❌ Missing NETWORK environment variable.");
    const availableNetworks = getAllNetworks();
    info(`Available networks: ${availableNetworks.join(", ")}`);
    process.exit(1);
  }

  const availableNetworks = getAllNetworks();
  if (!availableNetworks.includes(network)) {
    error(`❌ Network '${network}' not configured in Configuration.ts`);
    info(`Available networks: ${availableNetworks.join(", ")}`);
    process.exit(1);
  }

  const { signer, address } = await createNetworkSigner(network);
  return { network, signer, address };
}
