// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";

import { HASHES, HASH_KINDS, isHashKind } from "../../../../scripts/codegen/hashGen";

// Golden known-answer tests (KAT). Each value is the canonical hash produced
// by the BBND-1674 formula for the named PascalCase argument, captured at the
// moment the constant was generated for production use. If any of these
// assertions fail it means the formula or its inputs drifted, which would
// silently break every deployment that already granted the role / registered
// the resolver key / read from the storage slot. Treat KAT failures as a
// breaking change requiring coordinated redeploy.
describe("scripts/codegen/hashGen — canonical hashes", () => {
  describe("HASHES.role", () => {
    const cases: ReadonlyArray<[string, string]> = [
      ["BondManager", "0x68fe577385095e80beadf873ac12a3100f9a9d1b6d40f0d123eecf3d01bf5c49"],
      ["Cap", "0x58d502b7184e1a264e0cacf1a19a6c268356c6d9fda5ad83ab3b599cd3b7f41c"],
      ["Pauser", "0x3cb8b459fdb6e7dc3d2a2aa529e530f885d45e03584adb438423209c86a2731f"],
      ["CorporateAction", "0xa1acfc499025c99f55059195e6276f639d34a18aad7b8121b9192b7f438c55cd"],
      ["Kyc", "0x754f499f9fdfbb089d12bdec817a6863d593d8a3ea7f546c00a5cafd20957bfc"],
    ];
    for (const [arg, expected] of cases) {
      it(`hashes ${arg} to its canonical value`, () => {
        expect(HASHES.role(arg)).to.equal(expected);
      });
    }
  });

  describe("HASHES.resolverKey", () => {
    const cases: ReadonlyArray<[string, string]> = [
      ["Cap", "0x88a28e7c45a3ce8d4ca60cd480c98e1b46feb84caec725cb0a6cf96b2c5143b5"],
      ["Diamond", "0xd9202bb838fd8d0f2866f13141398cfb9fa74cbbbce7449c9158caffa9c509f4"],
      ["AccessControl", "0xccc2e755f9225e65f6c822a258c866fc0d57a124ad12c8928adf3ff875ffcd70"],
    ];
    for (const [arg, expected] of cases) {
      it(`hashes ${arg} to its canonical value`, () => {
        expect(HASHES.resolverKey(arg)).to.equal(expected);
      });
    }
  });

  describe("HASHES.corporateAction", () => {
    const cases: ReadonlyArray<[string, string]> = [
      ["Dividend", "0xcda4824099c82153d6d7a867a03a161c74e149619527030b479c1b7e514278a9"],
      ["Loan", "0x63662dbf36ac82e81145fd617ad48d666f2f58c08e352a9ab22a82603a34ef24"],
    ];
    for (const [arg, expected] of cases) {
      it(`hashes ${arg} to its canonical value`, () => {
        expect(HASHES.corporateAction(arg)).to.equal(expected);
      });
    }
  });

  describe("HASHES.scheduledTask", () => {
    const cases: ReadonlyArray<[string, string]> = [
      ["Snapshot", "0x5c2cacde8c00e9783d1a7240812af6e30345ef99c91dc19a8d17d73ac1eb7edd"],
      ["BalanceAdjustment", "0x999e2a7b5771bd471afc74da5b2094116762bb9a2f7b023ed1396b2db1e4505a"],
      ["CouponListing", "0xc058879f41e7686a6d6010c3d063f2914a8b867f82ced0451e8c19493e818bc8"],
    ];
    for (const [arg, expected] of cases) {
      it(`hashes ${arg} to its canonical value`, () => {
        expect(HASHES.scheduledTask(arg)).to.equal(expected);
      });
    }
  });

  describe("HASHES.storage (ERC-7201)", () => {
    const cases: ReadonlyArray<[string, string]> = [
      ["Cap", "0xabd29859a2443302b9905d8be07aab508a353cf611fff647d31b2a10ccb92100"],
      ["Bond", "0xa99cdff87e8b13602d53b3661888bce1eb21f534ea5cb3f8223de98640507c00"],
      ["Snapshot", "0x2e9cb27cc6da952dbadc3ddf8f7c0573a7ed5a7613f07ac9a8da248ab9442000"],
    ];
    for (const [arg, expected] of cases) {
      it(`derives ${arg} slot to its canonical value`, () => {
        expect(HASHES.storage(arg)).to.equal(expected);
      });
    }
  });
});

// Standard-conformance invariants that must hold regardless of the
// PascalCase argument used — protect against accidental formula refactors
// that would pass the KATs above (e.g. by adjusting both formula AND golden
// values together) but break the underlying spec.
describe("scripts/codegen/hashGen — invariants", () => {
  it("ERC-7201 mask zeroes the low byte for every storage slot", () => {
    for (const arg of ["Cap", "BondManager", "Snapshot", "ProtectedPartitions", "AccessControl"]) {
      expect(HASHES.storage(arg).slice(-2)).to.equal("00");
    }
  });

  it("is deterministic for repeated calls with the same input", () => {
    for (const arg of ["BondManager", "Cap", "Dividend"]) {
      expect(HASHES.role(arg)).to.equal(HASHES.role(arg));
      expect(HASHES.storage(arg)).to.equal(HASHES.storage(arg));
    }
  });

  it("returns distinct outputs for distinct inputs within the same family", () => {
    expect(HASHES.role("BondManager")).to.not.equal(HASHES.role("Cap"));
    expect(HASHES.storage("Cap")).to.not.equal(HASHES.storage("BondManager"));
    expect(HASHES.resolverKey("Cap")).to.not.equal(HASHES.resolverKey("Diamond"));
  });

  it("namespaces each family — same PascalArg differs across kinds", () => {
    // `Cap` exists in three families; their hashes must not collide.
    const r = HASHES.role("Cap");
    const k = HASHES.resolverKey("Cap");
    const s = HASHES.storage("Cap");
    expect(r).to.not.equal(k);
    expect(r).to.not.equal(s);
    expect(k).to.not.equal(s);
  });
});

describe("scripts/codegen/hashGen — type surface", () => {
  it("enumerates exactly the five canonical families", () => {
    expect([...HASH_KINDS].sort()).to.deep.equal([
      "corporateAction",
      "resolverKey",
      "role",
      "scheduledTask",
      "storage",
    ]);
  });

  it("isHashKind accepts every member of HASH_KINDS", () => {
    for (const kind of HASH_KINDS) {
      expect(isHashKind(kind)).to.equal(true);
    }
  });

  it("isHashKind rejects unknown kinds", () => {
    for (const s of ["", "ROLE", "Role", "storage_", "typehash", "unknown"]) {
      expect(isHashKind(s)).to.equal(false);
    }
  });
});
