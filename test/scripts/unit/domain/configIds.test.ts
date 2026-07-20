// SPDX-License-Identifier: Apache-2.0

/**
 * Value-lock tests for the BusinessLogicResolver configuration IDs.
 *
 * @remarks
 * Configuration IDs are deployment-breaking: a deployed BLR keys its facet
 * configurations by these exact bytes32 values, so they must never change.
 * These assertions pin each ID to its immutable on-chain value — an external
 * oracle independent of how `CONFIG_IDS` derives them — so any accidental
 * change to the derivation, ordering, or numbering fails here rather than in a
 * deployment.
 *
 * @module test/scripts/unit/domain/configIds.test
 */

import { expect } from "chai";
import { CONFIG_IDS } from "@lib";
import { INITIALIZE_MOCK_CONFIG_ID } from "@lib/domain";

describe("Configuration IDs", () => {
  it("pins the production config IDs to their immutable bytes32 values", () => {
    expect(CONFIG_IDS.equity).to.equal("0x0000000000000000000000000000000000000000000000000000000000000001");
    expect(CONFIG_IDS.bond).to.equal("0x0000000000000000000000000000000000000000000000000000000000000002");
    expect(CONFIG_IDS.depositToken).to.equal("0x0000000000000000000000000000000000000000000000000000000000000005");
    expect(CONFIG_IDS.factory).to.equal("0x0000000000000000000000000000000000000000000000000000000000000008");
  });

  it("pins the test-only InitializeMock config ID to its immutable bytes32 value", () => {
    expect(INITIALIZE_MOCK_CONFIG_ID).to.equal("0x0000000000000000000000000000000000000000000000000000000000000009");
  });
});
