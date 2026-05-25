// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _CUSTOM_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;
const _AMOUNT = 1000;

describe("Partitions Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: false,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  describe("isMultiPartition", () => {
    it("GIVEN a single-partition token WHEN isMultiPartition THEN returns false", async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);

      expect(await asset.isMultiPartition()).to.equal(false);
    });

    it("GIVEN a multi-partition token WHEN isMultiPartition THEN returns true", async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);

      expect(await asset.isMultiPartition()).to.equal(true);
    });
  });

  describe("partitionsOf", () => {
    it("GIVEN a holder with no balance WHEN partitionsOf THEN returns an empty array", async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);

      expect(await asset.partitionsOf(signer_C.address)).to.deep.equal([]);
    });

    it("GIVEN a holder funded on the default partition WHEN partitionsOf THEN returns that partition", async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);

      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: _AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      expect(await asset.partitionsOf(signer_C.address)).to.deep.equal([_DEFAULT_PARTITION]);
    });

    it("GIVEN a holder funded on multiple partitions WHEN partitionsOf THEN returns every partition in issuance order", async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);

      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: _AMOUNT,
        data: EMPTY_HEX_BYTES,
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _CUSTOM_PARTITION,
        tokenHolder: signer_C.address,
        value: _AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      expect(await asset.partitionsOf(signer_C.address)).to.deep.equal([_DEFAULT_PARTITION, _CUSTOM_PARTITION]);
    });
  });
});
