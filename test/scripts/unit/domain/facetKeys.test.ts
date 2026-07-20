// SPDX-License-Identifier: Apache-2.0

/**
 * Drift guards for `facetKeys.ts`: against the `@custom:hash` annotations in
 * contracts/ and against the facet set TypeChain generates.
 *
 * @module test/scripts/unit/domain/facetKeys.test
 */

import fs, { readFileSync } from "fs";
import path, { join } from "path";
import { sync as globSync } from "glob";
import { expect } from "chai";
import * as factories from "@contract-types";
import { FACET_KEY_ARGS, RESOLVER_KEYS_BY_FACET, ALL_FACETS } from "../../../../lib/domain/facetKeys";

const ROOT = path.resolve(__dirname, "../../../..");
const SCAN_GLOB = "contracts/**/*.sol";
const EXCLUDES = ["contracts/hardhat-dependency-compiler/**", "contracts/test/**", "contracts/**/test/**"];
const RESOLVER_KEY_ANNOTATION = /^\s*\/\/\/\s*@custom:hash\s+resolverKey\s+(\S+)\s*$/;

/** Every `@custom:hash resolverKey <Arg>` annotation argument in scan scope. */
function scanResolverKeyAnnotationArgs(): Set<string> {
  const files = globSync(SCAN_GLOB, { cwd: ROOT, ignore: EXCLUDES, absolute: true });
  const args = new Set<string>();
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r\n|\n/);
    for (const line of lines) {
      const match = line.match(RESOLVER_KEY_ANNOTATION);
      if (match) args.add(match[1]);
    }
  }
  return args;
}

/**
 * Facets whose `<Arg>` does NOT equal the facet name minus its trailing
 * `"Facet"` — see the per-entry `// Exception:` comments in facetKeys.ts.
 */
const NAMING_CONVENTION_EXCEPTIONS = new Set([
  "AdjustBalancesFacet",
  "ClearingHoldByPartitionFacet",
  "EIP712Facet",
  "ERC20PermitFacet",
  "ERC20VotesFacet",
  "ExternalControlListManagementFacet",
  "ExternalKycListManagementFacet",
  "ExternalPauseManagementFacet",
  "OperatorClearingHoldByPartitionFacet",
  "ScheduledCrossOrderedTasksFacet",
  "SecurityHoldersFacet",
  // Interfaces, not deployed on their own — share a concrete facet's key.
  "IComplianceFacet",
  "IHoldFacet",
]);

describe("facetKeys", () => {
  describe("(b) vs contracts — @custom:hash resolverKey annotations", () => {
    const annotatedResolverKeyArgs = scanResolverKeyAnnotationArgs();

    // TimeTravelFacet is deliberately absent from this loop: its FACET_KEY_ARGS
    // entry is null because its key is NOT annotation-derived. Its literal is
    // checked against its Solidity source below instead.
    for (const [facetName, arg] of Object.entries(FACET_KEY_ARGS)) {
      if (arg === null) continue;
      it(`${facetName}'s arg '${arg}' has a matching @custom:hash resolverKey annotation in contracts/`, () => {
        expect(
          annotatedResolverKeyArgs.has(arg),
          `'${arg}' (facet ${facetName}) not found among the @custom:hash resolverKey annotations in contracts/. ` +
            `Either the annotation was renamed and FACET_KEY_ARGS in lib/domain/facetKeys.ts is stale, or the arg ` +
            `here has a typo.`,
        ).to.be.true;
      });
    }

    // `<Arg>` is the facet name minus its trailing "Facet", unless excepted.
    for (const [facetName, arg] of Object.entries(FACET_KEY_ARGS)) {
      if (arg === null || NAMING_CONVENTION_EXCEPTIONS.has(facetName)) continue;
      it(`${facetName}'s arg follows the name-minus-"Facet" convention`, () => {
        expect(arg).to.equal(facetName.replace(/Facet$/, ""));
      });
    }

    it("every exception in NAMING_CONVENTION_EXCEPTIONS actually diverges from the convention", () => {
      // Keeps the exception list honest: if a facet's arg is ever brought back
      // in line with the convention, it must be removed from the list above.
      const stale = [...NAMING_CONVENTION_EXCEPTIONS].filter((facetName) => {
        const arg = FACET_KEY_ARGS[facetName as keyof typeof FACET_KEY_ARGS];
        return arg === null || arg === facetName.replace(/Facet$/, "");
      });
      expect(
        stale,
        stale.length > 0
          ? `${stale.join(", ")} no longer diverge(s) from the naming convention — remove from ` +
              `NAMING_CONVENTION_EXCEPTIONS in facetKeys.test.ts.`
          : undefined,
      ).to.be.empty;
    });

    it("RESOLVER_KEYS_BY_FACET.TimeTravelFacet matches _TIME_TRAVEL_RESOLVER_KEY in its Solidity source", () => {
      // The legacy TEST-ONLY key lives in a hand-written constants file (it
      // predates the @custom:hash formula), outside the hash-comparator scan
      // scope (contracts/test/** is excluded). Read it straight from source
      // so the TypeScript literal can never drift from the contract.
      const source = readFileSync(
        join(__dirname, "../../../../contracts/test/testTimeTravel/constants/resolverKeys.sol"),
        "utf8",
      );
      const match = source.match(/_TIME_TRAVEL_RESOLVER_KEY\s*=\s*(0x[0-9a-fA-F]{64})/);
      expect(match, "_TIME_TRAVEL_RESOLVER_KEY constant not found in resolverKeys.sol").to.not.be.null;
      expect(RESOLVER_KEYS_BY_FACET.TimeTravelFacet).to.equal(match![1]);
    });
  });

  describe("(c) vs typechain — FacetName drift guard", () => {
    // Mirrors the FacetName type derivation in facetKeys.ts at the value level:
    // every `<Name>Facet__factory` export except the TEST-ONLY mocks.
    const typechainFacetNames = new Set(
      Object.keys(factories)
        .filter((key) => key.endsWith("Facet__factory") && !key.startsWith("Mock"))
        .map((key) => key.replace(/__factory$/, "")),
    );
    const mapFacetNames = new Set<string>(ALL_FACETS);

    it("every facet TypeChain generates a factory for is present in FACET_KEY_ARGS", () => {
      const missing = [...typechainFacetNames].filter((name) => !mapFacetNames.has(name));
      expect(
        missing,
        missing.length > 0
          ? `New facet detected: add an entry to FACET_KEY_ARGS in lib/domain/facetKeys.ts ` +
              `(and its @custom:hash resolverKey annotation) for: ${missing.join(", ")}`
          : undefined,
      ).to.be.empty;
    });

    it("FACET_KEY_ARGS has no entry for a facet TypeChain no longer generates", () => {
      const stale = [...mapFacetNames].filter((name) => !typechainFacetNames.has(name));
      expect(
        stale,
        stale.length > 0
          ? `Removed facet detected: delete the FACET_KEY_ARGS entry in lib/domain/facetKeys.ts ` +
              `for: ${stale.join(", ")}`
          : undefined,
      ).to.be.empty;
    });
  });
});
