// SPDX-License-Identifier: Apache-2.0

/**
 * ABI extraction utilities for registry generation.
 *
 * Extracts method signatures from compiled contract ABIs.
 * Self-contained with no external dependencies beyond ethers.
 *
 * @module registry-generator/utils/abiExtractor
 */

import { Interface, keccak256, toUtf8Bytes } from "ethers";
import type { MethodDefinition } from "../types";

/**
 * Methods to exclude from facet registries (infrastructure methods).
 */
const STATIC_METHODS_TO_EXCLUDE = new Set([
  "getStaticFunctionSelectors",
  "getStaticInterfaceIds",
  "getStaticResolverKey",
]);

/**
 * Extract method definitions from a contract ABI.
 *
 * Processes the ABI array and extracts all function definitions,
 * excluding infrastructure methods like getStaticFunctionSelectors.
 *
 * @param abi - Contract ABI array
 * @returns Array of method definitions with names, signatures, and selectors
 */
export function extractMethodsFromABI(abi: any[]): MethodDefinition[] {
  const methods: MethodDefinition[] = [];

  try {
    const iface = new Interface(abi);
    const functions = iface.fragments.filter((f: any) => f.type === "function");

    for (const func of functions) {
      const name = (func as any).name;
      if (!STATIC_METHODS_TO_EXCLUDE.has(name)) {
        const signature = func.format("full");
        // Calculate selector: first 4 bytes of keccak256 hash of the signature
        const sighash = func.format("sighash");
        const hash = keccak256(toUtf8Bytes(sighash));
        const selector = hash.substring(0, 10); // '0x' + 8 hex chars = 4 bytes

        methods.push({ name, signature, selector });
      }
    }
  } catch (error) {
    // If ABI parsing fails, return empty array
    // This allows graceful degradation if ABI is malformed
    return [];
  }

  return methods;
}
