// SPDX-License-Identifier: Apache-2.0
//
// Unit tests for the rewriter (`applyHashGen.ts`). Each duplicate / collision /
// shape rule has a happy + sad fixture. Fixtures are materialised in a tmp
// directory shaped like `<tmp>/contracts/...` so the rewriter's glob picks
// them up exactly as in production.

import { expect } from "chai";
import fs from "fs";
import os from "os";
import path from "path";

import { collect } from "../../../../scripts/codegen/applyHashGen";
import { HASHES } from "../../../../scripts/codegen/hashGen";

// Canonical hashes pre-computed at authoring time. Keeping them inline keeps
// the fixtures self-documenting.
const H = {
  storageFoo: HASHES.storage("Foo"),
  storageBar: HASHES.storage("Bar"),
  roleCorporateAction: HASHES.role("CorporateAction"),
  resolverKeyCap: HASHES.resolverKey("Cap"),
};

function makeTmpRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "applyhashgen-"));
  fs.mkdirSync(path.join(root, "contracts"), { recursive: true });
  return root;
}

function write(root: string, rel: string, content: string): void {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

describe("scripts/codegen/applyHashGen — rewriter rules", () => {
  let root: string;

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true });
  });

  describe("happy path", () => {
    it("collects a single well-formed annotated constant with zero errors and zero drift", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/IFoo.sol",
        [
          "// SPDX-License-Identifier: Apache-2.0",
          "pragma solidity >=0.8.0 <0.9.0;",
          "",
          "/// @custom:hash storage Foo",
          `bytes32 constant STORAGE_LOCATION_FOO = ${H.storageFoo};`,
          "",
        ].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors).to.deep.equal([]);
      expect(r.drifts).to.deep.equal([]);
      expect(r.scan.annotated).to.have.length(1);
    });

    it("collects drift when the hex is wrong but the annotation is valid", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/IFoo.sol",
        [
          "// SPDX-License-Identifier: Apache-2.0",
          "pragma solidity >=0.8.0 <0.9.0;",
          "",
          "/// @custom:hash storage Foo",
          "bytes32 constant STORAGE_LOCATION_FOO = 0x0000000000000000000000000000000000000000000000000000000000000001;",
        ].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors).to.deep.equal([]);
      expect(r.drifts).to.have.length(1);
      expect(r.drifts[0].after).to.equal(H.storageFoo);
    });
  });

  describe("D1 — duplicate (kind, arg) annotation", () => {
    it("fails when the same (kind, arg) appears in two files", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        ["/// @custom:hash storage Foo", `bytes32 constant STORAGE_LOCATION_FOO = ${H.storageFoo};`].join("\n"),
      );
      write(
        root,
        "contracts/B.sol",
        ["/// @custom:hash storage Foo", `bytes32 constant STORAGE_LOCATION_FOO_ALIAS = ${H.storageFoo};`].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors.some((e) => /Duplicate @custom:hash annotation storage Foo/.test(e))).to.equal(true);
      expect(r.drifts).to.deep.equal([]);
    });
  });

  describe("D2 — duplicate constant identifier across files", () => {
    it("fails when the same identifier is declared in two files", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        ["/// @custom:hash storage Foo", `bytes32 constant STORAGE_LOCATION_FOO = ${H.storageFoo};`].join("\n"),
      );
      write(
        root,
        "contracts/B.sol",
        ["/// @custom:hash storage Bar", `bytes32 constant STORAGE_LOCATION_FOO = ${H.storageBar};`].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors.some((e) => /Duplicate constant identifier 'STORAGE_LOCATION_FOO'/.test(e))).to.equal(
        true,
      );
    });
  });

  describe("D7 — annotation immediately followed by another annotation", () => {
    it("fails when two annotations stack with no constant between them", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        [
          "/// @custom:hash storage Foo",
          "/// @custom:hash storage Bar",
          `bytes32 constant STORAGE_LOCATION_BAR = ${H.storageBar};`,
        ].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(
        r.validationErrors.some((e) => /immediately followed by another @custom:hash annotation/.test(e)),
      ).to.equal(true);
    });
  });

  describe("D8 — invalid PascalCase arg", () => {
    const cases = ["foo", "Foo_Bar", "FOO_BAR", "1Foo", "foo-bar"];
    for (const arg of cases) {
      it(`rejects invalid arg '${arg}'`, () => {
        root = makeTmpRoot();
        write(
          root,
          "contracts/A.sol",
          [`/// @custom:hash storage ${arg}`, `bytes32 constant STORAGE_LOCATION_X = ${H.storageFoo};`].join("\n"),
        );
        const r = collect({ rootDir: root });
        expect(r.validationErrors.some((e) => /invalid @custom:hash arg/.test(e))).to.equal(true);
      });
    }

    it("rejects unknown kind", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        ["/// @custom:hash unknownkind Foo", `bytes32 constant STORAGE_LOCATION_FOO = ${H.storageFoo};`].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors.some((e) => /unknown @custom:hash kind/.test(e))).to.equal(true);
    });
  });

  describe("Tier 1 #1 — symmetric identifier rule", () => {
    it("rejects an identifier that does not match the canonical UPPER_SNAKE of the arg", () => {
      root = makeTmpRoot();
      // arg=Foo => required identifier = STORAGE_LOCATION_FOO; we use a wrong one.
      write(
        root,
        "contracts/A.sol",
        ["/// @custom:hash storage Foo", `bytes32 constant STORAGE_LOCATION_FOOBAR = ${H.storageFoo};`].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(
        r.validationErrors.some((e) => /does not match the canonical name 'STORAGE_LOCATION_FOO'/.test(e)),
      ).to.equal(true);
    });

    it("accepts PascalCase args with embedded acronyms (KpiLinkedRate -> KPI_LINKED_RATE)", () => {
      const h = HASHES.resolverKey("KpiLinkedRate");
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        ["/// @custom:hash resolverKey KpiLinkedRate", `bytes32 constant RESOLVER_KEY_KPI_LINKED_RATE = ${h};`].join(
          "\n",
        ),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors).to.deep.equal([]);
    });
  });

  describe("D9 — non-canonical PascalCase arg (Kyc vs KYC collision)", () => {
    // pascalToUpperSnake is many-to-one: Kyc and KYC both -> 'KYC'; KpiLinkedRate
    // and KPILinkedRate both -> 'KPI_LINKED_RATE'. Each variant keccaks to a
    // DIFFERENT hash, so the validator must reject every form that isn't the
    // canonical round-trip target.
    const cases: ReadonlyArray<readonly [string, string]> = [
      ["KYC", "Kyc"],
      ["KPILinkedRate", "KpiLinkedRate"],
      ["BONDManager", "BondManager"],
      ["ERC1410", "Erc1410"],
    ];
    for (const [bad, canonical] of cases) {
      it(`rejects '${bad}' and points at the canonical form '${canonical}'`, () => {
        root = makeTmpRoot();
        write(
          root,
          "contracts/A.sol",
          [
            `/// @custom:hash role ${bad}`,
            `bytes32 constant ROLE_${bad
              .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
              .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
              .toUpperCase()} = 0x0000000000000000000000000000000000000000000000000000000000000000;`,
          ].join("\n"),
        );
        const r = collect({ rootDir: root });
        expect(
          r.validationErrors.some((e) => new RegExp(`non-canonical @custom:hash arg '${bad}'.*'${canonical}'`).test(e)),
        ).to.equal(true);
      });
    }

    it("accepts the canonical Kyc form (round-trip identity)", () => {
      const h = HASHES.role("Kyc");
      root = makeTmpRoot();
      write(root, "contracts/A.sol", ["/// @custom:hash role Kyc", `bytes32 constant ROLE_KYC = ${h};`].join("\n"));
      const r = collect({ rootDir: root });
      expect(r.validationErrors).to.deep.equal([]);
    });
  });

  describe("Tier 1 #2 — hash-shaped constant without annotation", () => {
    it("fails when a non-zero 64-hex bytes32 constant has no annotation", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        [
          "bytes32 constant HAND_PASTED_HASH = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;",
        ].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors.some((e) => /has a hash-shaped value.*no preceding @custom:hash/.test(e))).to.equal(
        true,
      );
    });

    it("ignores zero-valued bytes32 constants", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        ["bytes32 constant EMPTY_BYTES32 = 0x0000000000000000000000000000000000000000000000000000000000000000;"].join(
          "\n",
        ),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors).to.deep.equal([]);
    });

    it("allowlists DEFAULT_ADMIN_ROLE even with hash-shaped value", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        [
          "bytes32 constant DEFAULT_ADMIN_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000000;",
        ].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors).to.deep.equal([]);
    });

    it("allowlists *_TYPEHASH suffix even with hash-shaped value", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        ["bytes32 constant FOO_TYPEHASH = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;"].join(
          "\n",
        ),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors).to.deep.equal([]);
    });
  });

  describe("atomicity", () => {
    it("does not surface drift when validation has errors (no rewrite would happen)", () => {
      root = makeTmpRoot();
      write(
        root,
        "contracts/A.sol",
        // Valid drift target.
        ["/// @custom:hash storage Foo", `bytes32 constant STORAGE_LOCATION_FOO = ${H.storageBar};`].join("\n"),
      );
      write(
        root,
        "contracts/B.sol",
        // Invalid: PascalCase arg violated.
        ["/// @custom:hash storage bad_arg", `bytes32 constant STORAGE_LOCATION_X = ${H.storageFoo};`].join("\n"),
      );
      const r = collect({ rootDir: root });
      expect(r.validationErrors.length).to.be.greaterThan(0);
      // drift array should be empty because validation failed first.
      expect(r.drifts).to.deep.equal([]);
    });
  });
});
