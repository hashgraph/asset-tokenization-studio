import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type Security, IERC1410 } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { executeRbac } from "@test";
import { deployEquityTokenFixture } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";

describe("Security Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let securityFacet: Security;
  let erc1410Facet: IERC1410;

  async function deploySecurityFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
          internalKycActivated: false,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_A.address],
      },
    ]);

    securityFacet = await ethers.getContractAt("Security", diamond.target);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("security", () => {
    it("Check Security Total Holders and Holders when adding", async () => {
      const TotalTokenHolders_1 = await securityFacet.getTotalSecurityHolders();
      const TokenHolders_1 = await securityFacet.getSecurityHolders(0, TotalTokenHolders_1);

      await erc1410Facet.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: 1,
        data: "0x",
      });

      await erc1410Facet.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_B.address,
        value: 1,
        data: "0x",
      });

      await erc1410Facet.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_2,
        tokenHolder: signer_C.address,
        value: 1,
        data: "0x",
      });

      const TotalTokenHolders_2 = await securityFacet.getTotalSecurityHolders();
      const TokenHolders_2 = await securityFacet.getSecurityHolders(0, TotalTokenHolders_2);

      expect(TotalTokenHolders_1).to.equal(0);
      expect(TokenHolders_1.length).to.equal(TotalTokenHolders_1);

      expect(TotalTokenHolders_2).to.equal(3);
      expect(TokenHolders_2.length).to.equal(TotalTokenHolders_2);
      expect(TokenHolders_2).to.have.members([signer_A.address, signer_B.address, signer_C.address]);
    });

    it("Check Security Total Holders and Holders when removing", async () => {
      await erc1410Facet.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: 1,
        data: "0x",
      });

      await erc1410Facet.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_B.address,
        value: 1,
        data: "0x",
      });

      await erc1410Facet.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_2,
        tokenHolder: signer_C.address,
        value: 1,
        data: "0x",
      });

      const TotalTokenHolders_1 = await securityFacet.getTotalSecurityHolders();
      const TokenHolders_1 = await securityFacet.getSecurityHolders(0, TotalTokenHolders_1);

      await erc1410Facet.connect(signer_B).redeemByPartition(_PARTITION_ID_1, 1, "0x");

      const TotalTokenHolders_2 = await securityFacet.getTotalSecurityHolders();
      const TokenHolders_2 = await securityFacet.getSecurityHolders(0, TotalTokenHolders_2);

      await erc1410Facet.connect(signer_A).redeemByPartition(_PARTITION_ID_1, 1, "0x");

      const TotalTokenHolders_3 = await securityFacet.getTotalSecurityHolders();
      const TokenHolders_3 = await securityFacet.getSecurityHolders(0, TotalTokenHolders_3);

      await erc1410Facet.connect(signer_C).redeemByPartition(_PARTITION_ID_2, 1, "0x");

      const TotalTokenHolders_4 = await securityFacet.getTotalSecurityHolders();
      const TokenHolders_4 = await securityFacet.getSecurityHolders(0, TotalTokenHolders_4);

      expect(TotalTokenHolders_1).to.equal(3);
      expect(TokenHolders_1.length).to.equal(TotalTokenHolders_1);
      expect(TokenHolders_1).to.have.members([signer_A.address, signer_B.address, signer_C.address]);

      expect(TotalTokenHolders_2).to.equal(2);
      expect(TokenHolders_2.length).to.equal(TotalTokenHolders_2);
      expect(TokenHolders_2).to.have.members([signer_A.address, signer_C.address]);

      expect(TotalTokenHolders_3).to.equal(1);
      expect(TokenHolders_3.length).to.equal(TotalTokenHolders_3);
      expect(TokenHolders_3).to.have.members([signer_C.address]);

      expect(TotalTokenHolders_4).to.equal(0);
      expect(TokenHolders_4.length).to.equal(TotalTokenHolders_4);
    });

    it("Check Security Total Holders and Holders when replacing", async () => {
      await erc1410Facet.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: 1,
        data: "0x",
      });

      const TotalTokenHolders_1 = await securityFacet.getTotalSecurityHolders();
      const TokenHolders_1 = await securityFacet.getSecurityHolders(0, TotalTokenHolders_1);

      await erc1410Facet.transferByPartition(
        _PARTITION_ID_1,
        {
          to: signer_B.address,
          value: 1,
        },
        "0x",
      );

      const TotalTokenHolders_2 = await securityFacet.getTotalSecurityHolders();
      const TokenHolders_2 = await securityFacet.getSecurityHolders(0, TotalTokenHolders_2);

      expect(TotalTokenHolders_1).to.equal(1);
      expect(TokenHolders_1.length).to.equal(TotalTokenHolders_1);
      expect(TokenHolders_1).to.have.members([signer_A.address]);

      expect(TotalTokenHolders_2).to.equal(1);
      expect(TokenHolders_2.length).to.equal(TotalTokenHolders_2);
      expect(TokenHolders_2).to.have.members([signer_B.address]);
    });
  });
});
