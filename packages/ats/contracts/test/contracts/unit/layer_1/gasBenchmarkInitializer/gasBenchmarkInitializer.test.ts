// SPDX-License-Identifier: Apache-2.0

/**
 * Gas Benchmark: Counter-Based Auto-Operational (PoC)
 *
 * Measures gas per setFacetToReady call for N={1,5,10,25,50,100} facets.
 * Each call is O(1) because the counter replaces the batch iteration of
 * setOperationalStatus.
 *
 * Hedera reference limits (EVM-compatible):
 *   - Practical per-tx limit: ~7,500,000 gas
 *   - Hedera node hard cap:  15,000,000 gas
 *
 * The critical measurement is the GAS OF A SINGLE setFacetToReady CALL,
 * not the total across all N calls.  Even the "last" call (which also writes
 * configVersionStatus and emits TokenOperational) must stay under the limit.
 */

import { ethers } from "hardhat";
import { expect } from "chai";
import { GasBenchmarkInitializerHarness } from "@contract-types";

// Hedera EVM gas reference points
const HEDERA_PRACTICAL_LIMIT = 7_500_000n;
const HEDERA_NODE_HARD_CAP = 15_000_000n;

// Scenarios: number of facets in the initialisation flow
const SCENARIOS = [1, 5, 10, 25, 50, 100] as const;

interface ScenarioResult {
  n: number;
  firstCallGas: bigint;
  middleCallGas: bigint | null;
  lastCallGas: bigint;
  totalGas: bigint;
  withinPracticalLimit: boolean;
  withinNodeCap: boolean;
}

describe("Gas Benchmark: Counter-Based Auto-Operational (PoC)", () => {
  let harness: GasBenchmarkInitializerHarness;
  const results: ScenarioResult[] = [];

  before(async () => {
    const Factory = await ethers.getContractFactory("GasBenchmarkInitializerHarness");
    harness = (await Factory.deploy()) as unknown as GasBenchmarkInitializerHarness;
    await harness.waitForDeployment();
  });

  after(() => {
    // Print a summary table after all scenarios run
    console.log("\n  ╔══════════════════════════════════════════════════════════════════════════════╗");
    console.log("  ║              Counter-Based Auto-Operational — Gas Benchmark Results         ║");
    console.log("  ╠══════╦══════════════╦══════════════╦══════════════╦════════════════════════╣");
    console.log("  ║  N   ║  first call  ║  middle call ║  LAST call   ║  within 7.5M limit?    ║");
    console.log("  ╠══════╬══════════════╬══════════════╬══════════════╬════════════════════════╣");
    for (const r of results) {
      const middle = r.middleCallGas !== null ? r.middleCallGas.toString().padStart(12) : "     N/A    ";
      const withinLimit = r.withinPracticalLimit ? "  ✓ YES" : "  ✗ NO ";
      console.log(
        `  ║ ${String(r.n).padStart(4)} ║ ${r.firstCallGas.toString().padStart(12)} ║ ${middle} ║ ${r.lastCallGas.toString().padStart(12)} ║${withinLimit.padEnd(24)}║`,
      );
    }
    console.log("  ╚══════╩══════════════╩══════════════╩══════════════╩════════════════════════╝");
    console.log(`\n  Hedera practical limit: ${HEDERA_PRACTICAL_LIMIT.toLocaleString()} gas`);
    console.log(`  Hedera node hard cap:   ${HEDERA_NODE_HARD_CAP.toLocaleString()} gas\n`);
  });

  it("N=0 (target=0): setFacetToReady does NOT activate — counter-disabled branch", async () => {
    const configId = ethers.keccak256(ethers.toUtf8Bytes("benchmark-config-no-target"));
    const versionId = 99n;

    // target = 0 → _tryAutoActivate is a no-op
    await harness.setup(configId, versionId, 0n);

    const facetId = ethers.keccak256(ethers.toUtf8Bytes("facet-no-target-0"));
    await harness.setFacetToReady(facetId, 1n);

    expect(await harness.isOperational(configId, versionId)).to.be.false;
    expect(await harness.getInitializedCount(configId, versionId)).to.equal(0n);
  });

  for (const n of SCENARIOS) {
    it(`N=${n}: every single setFacetToReady call stays within Hedera limits`, async () => {
      const configId = ethers.keccak256(ethers.toUtf8Bytes(`benchmark-config-n${n}`));
      const versionId = BigInt(n);

      await harness.setup(configId, versionId, BigInt(n));

      let firstCallGas = 0n;
      let middleCallGas: bigint | null = null;
      let lastCallGas = 0n;
      let totalGas = 0n;

      for (let i = 0; i < n; i++) {
        const facetId = ethers.keccak256(ethers.toUtf8Bytes(`facet-${n}-${i}`));
        const tx = await harness.setFacetToReady(facetId, 1n);
        const receipt = await tx.wait();
        const gas = receipt!.gasUsed;

        totalGas += gas;
        if (i === 0) firstCallGas = gas;
        if (i === Math.floor(n / 2) && n > 2) middleCallGas = gas;
        if (i === n - 1) lastCallGas = gas;

        // Every individual call must stay within the Hedera hard cap
        expect(gas).to.be.lessThan(
          HEDERA_NODE_HARD_CAP,
          `call ${i + 1}/${n} used ${gas} gas — exceeds Hedera node hard cap`,
        );
      }

      // The config must be operational after all N calls
      expect(await harness.isOperational(configId, versionId)).to.be.true;
      expect(await harness.getInitializedCount(configId, versionId)).to.equal(BigInt(n));

      // The last call (which also emits TokenOperational) must stay within practical limit
      expect(lastCallGas).to.be.lessThan(
        HEDERA_PRACTICAL_LIMIT,
        `last call used ${lastCallGas} gas — exceeds Hedera practical limit of ${HEDERA_PRACTICAL_LIMIT}`,
      );

      results.push({
        n,
        firstCallGas,
        middleCallGas,
        lastCallGas,
        totalGas,
        withinPracticalLimit: lastCallGas < HEDERA_PRACTICAL_LIMIT,
        withinNodeCap: lastCallGas < HEDERA_NODE_HARD_CAP,
      });
    });
  }
});
