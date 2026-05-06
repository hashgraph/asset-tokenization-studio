// SPDX-License-Identifier: Apache-2.0

/**
 * Event-emission assertion helpers used by integration tests.
 *
 * These complement the chai `to.emit(...).withArgs(...)` matcher by enforcing
 * structural guarantees the matcher does not provide:
 *
 * - **No-duplicate guard**: chai's `to.emit` only requires AT LEAST one matching
 *   event. `expectExactlyOneEvent` asserts exactly one emission of a given event
 *   topic in a transaction receipt — catches accidental double-emit regressions.
 *
 * Extend incrementally as new structural assertions are needed.
 *
 * @module test/helpers/eventAssertions
 */

import { expect } from "chai";
import type { BaseContract, ContractTransactionReceipt } from "ethers";

/**
 * Asserts that exactly one log in `receipt` has `topics[0]` equal to the topic
 * hash of `eventName` on `contract`'s ABI.
 *
 * Use after `await expect(tx).to.emit(contract, NAME).withArgs(...)` to also
 * guarantee the event fired exactly once (per the project's event-emission
 * "one event per external call" rule).
 *
 * @param receipt    The mined transaction receipt to inspect.
 * @param contract   Any `BaseContract` whose interface declares the event
 *                   (typically the diamond `IAsset` handle used in the test).
 * @param eventName  The exact event name as declared on the writer interface.
 *
 * @example
 * const tx = asset.connect(signer).method(...);
 * await expect(tx).to.emit(asset, EVENT_NAMES.X).withArgs(...);
 * const receipt = await (await tx).wait();
 * expectExactlyOneEvent(receipt!, asset, EVENT_NAMES.X);
 */
export function expectExactlyOneEvent(
  receipt: ContractTransactionReceipt,
  contract: BaseContract,
  eventName: string,
): void {
  const eventFragment = contract.interface.getEvent(eventName);
  if (!eventFragment) {
    throw new Error(`Event ${eventName} not found on contract interface`);
  }
  const topicHash = eventFragment.topicHash;
  const matches = receipt.logs.filter((l) => l.topics[0] === topicHash);
  expect(matches.length).to.equal(1, `expected exactly one ${eventName} emission, got ${matches.length}`);
}
