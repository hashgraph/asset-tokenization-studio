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
import type { ErrorDefinition, EventDefinition, MethodDefinition } from "../types";

/**
 * Combined extraction result — methods, events, and errors from a single
 * Interface parse. Use {@link extractAbiDefinitions} to avoid re-parsing
 * the same ABI three times.
 */
export interface AbiDefinitions {
  methods: MethodDefinition[];
  events: EventDefinition[];
  errors: ErrorDefinition[];
}

/**
 * Methods to exclude from facet registries (infrastructure methods).
 */
const STATIC_METHODS_TO_EXCLUDE = new Set([
  "getStaticFunctionSelectors",
  "getStaticInterfaceIds",
  "getStaticResolverKey",
]);

/**
 * Extract methods, events, and errors from a contract ABI in a single pass.
 *
 * Constructing `new Interface(abi)` is the dominant cost; doing it once and
 * categorising the fragments is materially faster than calling the three
 * specialised extractors separately.
 *
 * @param abi - Contract ABI array
 * @returns All three categories sorted by name
 */
export function extractAbiDefinitions(abi: any[]): AbiDefinitions {
  const methods: MethodDefinition[] = [];
  const events: EventDefinition[] = [];
  const errors: ErrorDefinition[] = [];

  try {
    const iface = new Interface(abi);
    for (const fragment of iface.fragments) {
      const kind = (fragment as any).type;
      if (kind !== "function" && kind !== "event" && kind !== "error") continue;
      const name = (fragment as any).name;
      if (kind === "function" && STATIC_METHODS_TO_EXCLUDE.has(name)) continue;

      const canonical = fragment.format("sighash");
      const hash = keccak256(toUtf8Bytes(canonical));
      const signature = { full: fragment.format("full"), canonical };

      if (kind === "function") {
        methods.push({ name, signature, selector: hash.substring(0, 10) });
      } else if (kind === "event") {
        events.push({ name, signature, topic0: hash });
      } else {
        errors.push({ name, signature, selector: hash.substring(0, 10) });
      }
    }
  } catch (_error) {
    return { methods: [], events: [], errors: [] };
  }

  methods.sort((a, b) => a.name.localeCompare(b.name));
  events.sort((a, b) => a.name.localeCompare(b.name));
  errors.sort((a, b) => a.name.localeCompare(b.name));
  return { methods, events, errors };
}

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
        const canonical = func.format("sighash");
        const hash = keccak256(toUtf8Bytes(canonical));
        methods.push({
          name,
          signature: { full: func.format("full"), canonical },
          selector: hash.substring(0, 10),
        });
      }
    }
  } catch (_error) {
    // If ABI parsing fails, return empty array
    // This allows graceful degradation if ABI is malformed
    return [];
  }

  return methods;
}
