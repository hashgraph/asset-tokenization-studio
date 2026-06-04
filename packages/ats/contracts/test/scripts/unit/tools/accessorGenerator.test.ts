// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the EVM accessor generator.
 *
 * @remarks
 * The generator is the linchpin of the compile-time test-override pattern: prod
 * builds MUST contain zero override machinery while test builds back each native
 * value with a dedicated ERC-7201 override store plus per-accessor readers/writers.
 * These tests lock both invariants and the naming contract that
 * `EvmAccessorsFacet.sol` depends on. They are data-driven off the real
 * {@link ACCESSORS} manifest, so adding an accessor cannot silently escape coverage.
 *
 * @module test/scripts/unit/tools/accessorGenerator.test
 */

import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import {
  generateEvmAccessorsSource as generate,
  ACCESSORS,
  overrideReaderName,
  writerName,
  storageFieldName,
  EVM_ACCESSORS_STORAGE_STRUCT as STORAGE_STRUCT,
  EVM_ACCESSORS_STORAGE_LOCATION_CONSTANT as STORAGE_LOCATION_CONSTANT,
  EVM_ACCESSORS_STORAGE_HASH_NAME as STORAGE_HASH_NAME,
  EVM_ACCESSORS_STORAGE_NAMESPACE as STORAGE_NAMESPACE,
  EVM_ACCESSORS_STORAGE_REF as STORAGE_REF,
  evmAccessorsStorageSlot,
} from "@scripts/tools";

// Drift guard: the real EvmAccessors.sol is gitignored and never appears in a PR
// diff, so a manifest/generator change to the emitted source would otherwise be
// invisible to review. These committed snapshots make any such change a reviewed
// diff. Set UPDATE_ACCESSOR_SNAPSHOTS=true to regenerate them after an intentional
// change.
const SNAPSHOT_DIR = path.join(__dirname, "__snapshots__");

describe("EVM Accessor Generator", () => {
  const prod = generate("prod");
  const test = generate("test");

  describe("Manifest naming derivations", () => {
    it("derives the writer name by swapping the get-prefix for set + Override", () => {
      expect(writerName("getBlockTimestamp")).to.equal("setBlockTimestampOverride");
      expect(writerName("getMsgSender")).to.equal("setMsgSenderOverride");
      expect(writerName("getChainId")).to.equal("setChainIdOverride");
    });

    it("derives the override reader name by appending Override", () => {
      expect(overrideReaderName("getBlockTimestamp")).to.equal("getBlockTimestampOverride");
      expect(overrideReaderName("getChainId")).to.equal("getChainIdOverride");
    });

    it("derives the storage field name as camelCase base + Override", () => {
      expect(storageFieldName("getBlockTimestamp")).to.equal("blockTimestampOverride");
      expect(storageFieldName("getMsgSender")).to.equal("msgSenderOverride");
    });

    it("manifest covers exactly the four native EVM values in use", () => {
      expect(ACCESSORS.map((accessor) => accessor.nativeExpression)).to.have.members([
        "block.timestamp",
        "block.number",
        "msg.sender",
        "block.chainid",
      ]);
    });
  });

  describe("Common structure (both modes)", () => {
    for (const mode of ["prod", "test"] as const) {
      const source = mode === "prod" ? prod : test;

      it(`${mode} mode emits the SPDX header, pragma, auto-gen banner and library`, () => {
        expect(source).to.match(/^\/\/ SPDX-License-Identifier: Apache-2\.0/);
        expect(source).to.include("// AUTO-GENERATED — DO NOT EDIT.");
        expect(source).to.include("pragma solidity >=0.8.0 <0.9.0;");
        expect(source).to.include("library EvmAccessors {");
      });

      it(`${mode} mode exposes a getter for every manifest accessor`, () => {
        for (const accessor of ACCESSORS) {
          expect(source).to.include(`function ${accessor.name}()`);
        }
      });
    }
  });

  describe("Prod mode — zero test machinery", () => {
    it("every getter inlines its native opcode and returns the bare type", () => {
      for (const accessor of ACCESSORS) {
        expect(prod).to.include(`function ${accessor.name}() internal view returns (${accessor.solidityType}) {`);
        expect(prod).to.include(`return ${accessor.nativeExpression};`);
      }
    });

    it("contains no override storage, assembly or override functions", () => {
      // The whole point of the pattern: a prod artifact the compiler cannot even
      // reason about as test-aware — no override slot to poison, no SLOAD tax.
      expect(prod).to.not.include(STORAGE_STRUCT);
      expect(prod).to.not.include(STORAGE_LOCATION_CONSTANT);
      expect(prod).to.not.include("assembly");
      expect(prod).to.not.include("@custom:storage-location");
      // No override reader/writer declarations for any accessor — derived from the
      // manifest so the assertion stays exact even if an accessor name ever
      // contained the substring "Override".
      for (const accessor of ACCESSORS) {
        expect(prod).to.not.include(`function ${writerName(accessor.name)}`);
        expect(prod).to.not.include(`function ${overrideReaderName(accessor.name)}`);
      }
    });
  });

  describe("Test mode — ERC-7201 override store + readers/writers", () => {
    it("declares one namespaced override struct with the canonical 5-region layout", () => {
      expect(test).to.include(`/// @custom:hash storage ${STORAGE_HASH_NAME}`);
      expect(test).to.include(`bytes32 constant ${STORAGE_LOCATION_CONSTANT} =`);
      expect(test).to.include(`/// @custom:storage-location erc7201:${STORAGE_NAMESPACE}`);
      expect(test).to.include(`struct ${STORAGE_STRUCT} {`);
      for (const banner of ["R1 Lifecycle", "R2 Packed scalars", "R3 Single-slot scalars", "R4 Aggregates"]) {
        expect(test).to.include(banner);
      }
      expect(test).to.include("APPEND-ONLY ZONE BELOW");
    });

    it("addresses the override store at the codegen-derived ERC-7201 slot (P2.5)", () => {
      // The slot the assembly reads MUST be the codegen's own hash for the namespace.
      // Locking it here means a manifest rename, a codegen prefix change, or a stray
      // hand-edit that moved the override store would fail before reaching a token.
      const slot = evmAccessorsStorageSlot();
      expect(slot).to.match(/^0x[0-9a-f]{64}$/);
      expect(slot).to.not.equal(`0x${"0".repeat(64)}`);
      expect(test).to.include(`bytes32 constant ${STORAGE_LOCATION_CONSTANT} = ${slot};`);
      // The annotation MUST be the true pre-image of the slot: the canonical ATS
      // prefix the codegen hashes — not the stale `security.token.standard` form.
      expect(STORAGE_NAMESPACE).to.match(/^asset\.tokenization\.standard\.storage\./);
    });

    it("holds one override field per accessor, typed to the accessor", () => {
      for (const accessor of ACCESSORS) {
        expect(test).to.include(`${accessor.solidityType} ${storageFieldName(accessor.name)};`);
      }
    });

    it("every getter falls back to the native value only on the sentinel", () => {
      for (const accessor of ACCESSORS) {
        expect(test).to.include(`value_ = ${STORAGE_REF}().${storageFieldName(accessor.name)};`);
        expect(test).to.include(`return value_ == ${accessor.sentinel} ? ${accessor.nativeExpression} : value_;`);
      }
    });

    it("exposes the override reader and writer the facet relies on, per accessor", () => {
      for (const accessor of ACCESSORS) {
        expect(test).to.include(
          `function ${overrideReaderName(accessor.name)}() internal view returns (${accessor.solidityType} value_)`,
        );
        expect(test).to.include(`function ${writerName(accessor.name)}(${accessor.solidityType} value) internal`);
      }
    });

    it("confines inline assembly to the single ERC-7201 storage-ref accessor", () => {
      expect(test).to.include(`function ${STORAGE_REF}() private pure returns (${STORAGE_STRUCT} storage overrides_)`);
      expect(test).to.include("overrides_.slot := position");
      // Exactly one assembly block — the storage accessor; getters/readers/writers
      // use plain struct-field access. (Match the block opener, not the
      // `no-inline-assembly` solhint comment.)
      expect(test.match(/assembly\s*\{/g) ?? []).to.have.length(1);
    });
  });

  describe("Drift guard — committed snapshots", () => {
    for (const mode of ["prod", "test"] as const) {
      it(`${mode}-mode generated source matches the committed snapshot`, () => {
        const generated = mode === "prod" ? prod : test;
        const snapshotPath = path.join(SNAPSHOT_DIR, `EvmAccessors.${mode}.sol.snap`);

        if (process.env.UPDATE_ACCESSOR_SNAPSHOTS === "true") {
          fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
          fs.writeFileSync(snapshotPath, generated, "utf8");
        }

        const expected = fs.readFileSync(snapshotPath, "utf8");
        expect(
          generated,
          `Generated ${mode}-mode EvmAccessors.sol drifted from its snapshot. If this is intentional, ` +
            `re-run with UPDATE_ACCESSOR_SNAPSHOTS=true and commit ${path.relative(process.cwd(), snapshotPath)}.`,
        ).to.equal(expected);
      });
    }
  });
});
