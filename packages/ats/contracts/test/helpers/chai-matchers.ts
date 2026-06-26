// SPDX-License-Identifier: Apache-2.0

import chai from "chai";
import { TransactionReceipt } from "ethers";
import { KNOWN_ERRORS, extractErrorSelector } from "./errors";

interface ExtendedContract {
  interface: {
    getError: (name: string) => { selector?: string } | null;
    parseLog: (log: { topics?: unknown[]; data: string }) => { name: string; args?: unknown[] } | null;
  };
}

function extractRevertSelector(receipt: TransactionReceipt | null): string | null {
  if (!receipt || !receipt.logs) {
    return null;
  }

  for (const log of receipt.logs) {
    if (log.data && log.data !== "0x") {
      const selector = extractErrorSelector(log.data);
      if (selector !== "0x08c379a0" && selector !== "0x45e98343" && selector !== "0x") {
        return selector;
      }
    }
  }

  return null;
}

function selectorMatchesError(selector: string, errorName: string): boolean {
  const knownSelector = KNOWN_ERRORS[errorName];
  if (knownSelector) {
    return selector.toLowerCase() === knownSelector.toLowerCase();
  }
  return false;
}

function findCustomErrorInReceipt(
  receipt: TransactionReceipt | null,
  contract: ExtendedContract,
  errorName: string,
): { found: boolean; actualSelector?: string; reason?: string } {
  if (!receipt || !receipt.logs || receipt.logs.length === 0) {
    return { found: false, reason: "No receipt or logs" };
  }

  if (contract.interface) {
    try {
      for (const log of receipt.logs) {
        const decoded = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (decoded && decoded.name === errorName) {
          return { found: true };
        }
      }
    } catch {
      // Fall through
    }
  }

  const actualSelector = extractRevertSelector(receipt);
  if (actualSelector) {
    if (selectorMatchesError(actualSelector, errorName)) {
      return { found: true };
    }
    return { found: false, actualSelector, reason: "Selector mismatch" };
  }

  return { found: false, reason: "Could not extract selector" };
}

let patchInitialized = false;

/**
 * Patch the hardhat-chai-matchers `revertedWithCustomError` to fall back to KNOWN_ERRORS
 * when a custom error is not in the contract's own ABI (happens during multi-facet deploys
 * where the final proxy's ABI may be partial). Safe to call multiple times; subsequent calls
 * are no-ops (initialization flag).
 */
export function initCustomChaiMatchers(): void {
  if (patchInitialized) {
    return;
  }

  const originalMethod = (chai.Assertion.prototype as any).revertedWithCustomError;

  if (!originalMethod) {
    // Method doesn't exist yet (hardhat-chai-matchers not loaded); will be retried on next call
    return;
  }

  patchInitialized = true;

  (chai.Assertion.prototype as any).revertedWithCustomError = function (
    contract: ExtendedContract,
    errorName: string,
  ): typeof chai.Assertion.prototype {
    let errorFragment = null;
    if (contract.interface) {
      errorFragment = contract.interface.getError(errorName);
    }

    if (errorFragment) {
      return originalMethod.call(this, contract, errorName);
    }

    if (!KNOWN_ERRORS[errorName]) {
      throw new Error(`The given contract doesn't have a custom error named '${errorName}'`);
    }

    const assertion = this as { _obj: Promise<unknown> };
    const promise = assertion._obj;

    return new (chai.Assertion as any)(
      promise.then(async (txResponse: unknown) => {
        const tx = txResponse as { wait: () => Promise<TransactionReceipt | null> };
        const receipt = tx.wait ? await tx.wait() : null;
        const result = findCustomErrorInReceipt(receipt, contract, errorName);

        if (!result.found) {
          const expectedSelector = KNOWN_ERRORS[errorName];
          const message = result.actualSelector
            ? `Expected custom error '${errorName}' (selector: ${expectedSelector}) but got selector: ${result.actualSelector}`
            : `Expected custom error '${errorName}' but could not verify - ${result.reason}`;

          throw new Error(message);
        }

        return txResponse;
      }),
    );
  };
}

// Attempt to initialize in Node.js on import; may be a no-op if hardhat-chai-matchers
// isn't loaded yet. In mocha --parallel, the shard runner will call initCustomChaiMatchers()
// again in a `before` hook to ensure initialization after all dependencies are loaded.
if (typeof window === "undefined") {
  try {
    initCustomChaiMatchers();
  } catch (error) {
    console.debug("[chai-matchers] Deferred initialization:", (error as Error).message);
  }
}
