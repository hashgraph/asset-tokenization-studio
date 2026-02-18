// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, NoncesFacet } from "@contract-types";
import { deployEquityTokenFixture } from "@test";

describe("Nonces Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;

  let noncesFacet: NoncesFacet;

  beforeEach(async () => {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;

    noncesFacet = await ethers.getContractAt("NoncesFacet", diamond.target);
  });

  describe("Nonces", () => {
    it("GIVEN any account WHEN nonces is called THEN the current nonce for that account is returned", async () => {
      const nonces = await noncesFacet.nonces(signer_A.address);
      expect(nonces).to.equal(0);
    });
  });
});
