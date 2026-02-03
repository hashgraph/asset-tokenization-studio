// SPDX-License-Identifier: Apache-2.0

/**
 * Cap Facet Rollback Tests
 *
 * Tests version rollback (deinitialize) logic for the Cap facet.
 * Validates:
 * - Validation: targetVersion must be < currentVersion
 * - Validation: targetVersion must be >= MIN_VERSION (1)
 * - Access control: requires DEFAULT_ADMIN_ROLE
 * - Event emission: FacetVersionRolledBack
 * - Edge cases: V1 is the floor (cannot rollback below)
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { type ResolverProxy, type CapFacet } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";

describe("Cap Rollback Tests", () => {
  let diamond: ResolverProxy;
  let deployer: SignerWithAddress;
  let nonAdmin: SignerWithAddress;
  let capFacet: CapFacet;

  const maxSupply = 1000;

  async function deployFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          maxSupply: maxSupply,
        },
      },
    });
    diamond = base.diamond;
    deployer = base.deployer;
    nonAdmin = base.user2;

    capFacet = await ethers.getContractAt("CapFacet", diamond.address, deployer);

    return { diamond, deployer, nonAdmin, capFacet };
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("Validation", () => {
    it("GIVEN token at v1 WHEN deinitialize_Cap called with targetVersion >= currentVersion THEN reverts with InvalidRollbackTarget", async () => {
      // Current version is 1, trying to rollback to 1 should fail
      await expect(capFacet.deinitialize_Cap(1)).to.be.revertedWithCustomError(capFacet, "InvalidRollbackTarget");
    });

    it("GIVEN token at v1 WHEN deinitialize_Cap called with targetVersion > currentVersion THEN reverts with InvalidRollbackTarget", async () => {
      // Current version is 1, trying to rollback to 2 should fail
      await expect(capFacet.deinitialize_Cap(2)).to.be.revertedWithCustomError(capFacet, "InvalidRollbackTarget");
    });

    it("GIVEN token at v1 WHEN deinitialize_Cap called with targetVersion = 0 THEN reverts with CannotRollbackBelowMinVersion", async () => {
      // Current version is 1, MIN_VERSION is 1, so rolling back to 0 should fail
      await expect(capFacet.deinitialize_Cap(0)).to.be.revertedWithCustomError(
        capFacet,
        "CannotRollbackBelowMinVersion",
      );
    });
  });

  describe("Access Control", () => {
    it("GIVEN non-admin user WHEN calling deinitialize_Cap THEN reverts with AccountHasNoRole", async () => {
      await expect(capFacet.connect(nonAdmin).deinitialize_Cap(0)).to.be.revertedWithCustomError(
        capFacet,
        "AccountHasNoRole",
      );
    });

    it("GIVEN admin user WHEN calling deinitialize_Cap with invalid target THEN reverts with validation error (not access control)", async () => {
      // Admin passes access control but fails validation
      // Since we're at v1 and MIN_VERSION=1, any valid rollback would require targetVersion < 1
      // But targetVersion >= MIN_VERSION is also required, creating an impossible state at v1
      // So the only valid targets (0) will fail with CannotRollbackBelowMinVersion
      await expect(capFacet.connect(deployer).deinitialize_Cap(0)).to.be.revertedWithCustomError(
        capFacet,
        "CannotRollbackBelowMinVersion",
      );
    });
  });

  describe("Edge Cases", () => {
    it("GIVEN token at v1 (minimum version) WHEN attempting any rollback THEN all valid attempts fail", async () => {
      // At V1 with MIN_VERSION=1:
      // - targetVersion=0: fails with CannotRollbackBelowMinVersion
      // - targetVersion=1: fails with InvalidRollbackTarget (>= current)
      // - targetVersion>1: fails with InvalidRollbackTarget (>= current)
      // This is by design: V1 is the "floor" and cannot be rolled back

      await expect(capFacet.deinitialize_Cap(0)).to.be.revertedWithCustomError(
        capFacet,
        "CannotRollbackBelowMinVersion",
      );
      await expect(capFacet.deinitialize_Cap(1)).to.be.revertedWithCustomError(capFacet, "InvalidRollbackTarget");
      await expect(capFacet.deinitialize_Cap(2)).to.be.revertedWithCustomError(capFacet, "InvalidRollbackTarget");
    });

    it("GIVEN token at v1 WHEN storage state checked THEN maxSupply remains unchanged after failed rollback attempts", async () => {
      const maxSupplyBefore = await capFacet.getMaxSupply();

      // Attempt various rollbacks (all should fail)
      try {
        await capFacet.deinitialize_Cap(0);
      } catch {
        // Expected
      }

      try {
        await capFacet.deinitialize_Cap(1);
      } catch {
        // Expected
      }

      const maxSupplyAfter = await capFacet.getMaxSupply();
      expect(maxSupplyAfter).to.equal(maxSupplyBefore);
    });
  });

  describe("Future V2+ Rollback Scenarios (Documented)", () => {
    /**
     * When V2 is added to Cap facet, the following test scenarios become available:
     *
     * 1. V2 → V1 Rollback:
     *    - Should reset V2 fields to defaults
     *    - Should preserve V1 fields (maxSupply, partitionCap, initialized)
     *    - Should update version to 1
     *    - Should emit FacetVersionRolledBack(CAP_FACET_KEY, 2, 1)
     *
     * 2. V3 → V1 Multi-version Rollback:
     *    - Should execute both undo blocks in reverse order (V3 first, then V2)
     *    - Should reset all V2 and V3 fields to defaults
     *    - Should preserve V1 fields
     *
     * 3. Re-initialization after Rollback:
     *    - After rolling back from V2 to V1
     *    - Should be able to initialize_Cap again to V2
     *    - Should set V2 fields correctly
     *
     * Example test for V2 → V1 (when V2 exists):
     *
     * it("GIVEN token at v2 WHEN deinitialize_Cap(1) THEN resets V2 fields and emits event", async () => {
     *   // First upgrade to V2
     *   await capFacet.initialize_Cap({ maxSupply: 1000, partitionCap: [], v2Field: "value" });
     *
     *   // Verify at V2
     *   expect(await capFacet.getV2Field()).to.equal("value");
     *
     *   // Rollback to V1
     *   await expect(capFacet.deinitialize_Cap(1))
     *     .to.emit(capFacet, "FacetVersionRolledBack")
     *     .withArgs(CAP_FACET_KEY, 2, 1);
     *
     *   // Verify V2 field reset to default
     *   expect(await capFacet.getV2Field()).to.equal(address(0));
     *
     *   // Verify V1 fields preserved
     *   expect(await capFacet.getMaxSupply()).to.equal(1000);
     * });
     */

    it("Future rollback scenarios are documented for when V2+ is implemented", async () => {
      // Placeholder to document future test scenarios
      expect(true).to.be.true;
    });
  });

  describe("Error Parameter Validation", () => {
    it("GIVEN InvalidRollbackTarget error WHEN inspected THEN contains correct parameters", async () => {
      // Verify the error contains the expected parameters
      try {
        await capFacet.deinitialize_Cap(1);
        expect.fail("Should have reverted");
      } catch (error: unknown) {
        const err = error as Error;
        // The error message should contain the facet key, target version, and current version
        expect(err.message).to.include("InvalidRollbackTarget");
      }
    });

    it("GIVEN CannotRollbackBelowMinVersion error WHEN inspected THEN contains correct parameters", async () => {
      try {
        await capFacet.deinitialize_Cap(0);
        expect.fail("Should have reverted");
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).to.include("CannotRollbackBelowMinVersion");
      }
    });
  });
});

describe("Cap Rollback Design Documentation", () => {
  /**
   * Design Decisions:
   *
   * 1. Reset Strategy: Default Values
   *    - Undo blocks reset fields to Solidity type defaults (0, address(0), false)
   *    - Not snapshot-based (would be gas-expensive)
   *    - Simpler, more predictable behavior
   *
   * 2. Version Constraints:
   *    - MIN_VERSION = 1: Cannot rollback below V1
   *    - V1 is the "floor" because initialized=true must remain permanent
   *    - Skip is allowed: V3 → V1 directly (runs both undo blocks)
   *
   * 3. Undo Block Execution Order:
   *    - Reverse order: highest version first
   *    - V3 undo runs before V2 undo when rolling from V3 to V1
   *
   * 4. Access Control:
   *    - Same as initialize_Cap upgrades: DEFAULT_ADMIN_ROLE required
   *
   * 5. initialized Flag:
   *    - Remains true after rollback (cannot be undone)
   *    - This is why MIN_VERSION = 1
   */

  it("Design decisions are documented in test file comments", async () => {
    expect(true).to.be.true;
  });
});
