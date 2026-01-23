#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * CLI utilities for network handling with user-friendly exit behavior.
 *
 * This is the CLI LAYER - functions call process.exit() with helpful error
 * messages for terminal users. For programmatic use where you need try/catch
 * error handling, use the infrastructure layer directly.
 *
 * @module cli/shared/network
 */

import { Signer } from "ethers";
import { getAllNetworks, createNetworkSigner, info, error } from "@scripts/infrastructure";

/**
 * Result of requiring a network signer from CLI environment.
 *
 * Extends the infrastructure's NetworkSignerResult with the network name
 * for CLI logging and output purposes.
 */
export interface CliNetworkSignerResult {
  /** Network identifier from NETWORK env var */
  network: string;
  /** The ethers.js Signer instance */
  signer: Signer;
  /** The signer's resolved address */
  address: string;
}

/**
 * Parse and validate NETWORK environment variable, then create a signer.
 * Exits process with helpful error if validation fails.
 *
 * @returns Network name, signer, and deployer address
 */
export async function requireNetworkSigner(): Promise<CliNetworkSignerResult> {
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
