// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, IAssetMock } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { grantRoleAndPauseToken } from "../../../../common";
import { deployAssetMockCtx } from "@test";
import { executeRbac } from "@test";
import { ATS_ROLES, RESOLVER_KEY_DOCUMENTATION } from "@scripts";

const documentName_1 = "0x000000000000000000000000000000000000000000000000000000000000aa23";
const documentName_2 = "0x000000000000000000000000000000000000000000000000000000000000bb23";
const documentURI_1 = "https://whatever.com";
const documentHASH_1 = "0x000000000000000000000000000000000000000000000000000000000000cc32";
const documentURI_2 = "https://whatever2.com";
const documentHASH_2 = "0x000000000000000000000000000000000000000000000000000000000002cc32";

export function documentationTests(): void {
  describe("Documentation Tests", () => {
    let deployer: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;
    let diamond: ResolverProxy;

    async function deployFixture() {
      const ctx = await loadFixture(deployAssetMockCtx);
      deployer = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      diamond = ctx.diamond;

      asset = ctx.asset;

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
      ]);
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

    it("GIVEN an account without documenter role WHEN setDocument THEN transaction fails with AccountHasNoRole", async () => {
      // add document fails
      await expect(
        asset.connect(signer_C).setDocument(documentName_1, documentURI_1, documentHASH_1),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN an account without documenter role WHEN removeDocument THEN transaction fails with AccountHasNoRole", async () => {
      // add document fails
      await expect(asset.connect(signer_C).removeDocument(documentName_1)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN setDocument THEN transaction fails with IsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_DOCUMENTER, deployer, signer_B, signer_C.address);

      // add document fails
      await expect(
        asset.connect(signer_C).setDocument(documentName_1, documentURI_1, documentHASH_1),
      ).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN a paused Token WHEN removeDocument THEN transaction fails with IsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_DOCUMENTER, deployer, signer_B, signer_C.address);

      // remove document
      await expect(asset.connect(signer_C).removeDocument(documentName_1)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN a document with no name WHEN setDocument THEN transaction fails with EmptyName", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_DOCUMENTER, signer_C.address);

      // add document fails
      await expect(
        asset
          .connect(signer_C)
          .setDocument(
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            documentURI_1,
            documentHASH_1,
          ),
      ).to.be.revertedWithCustomError(asset, "EmptyName");
    });

    it("GIVEN a document with no URI WHEN setDocument THEN transaction fails with EmptyURI", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_DOCUMENTER, signer_C.address);
      // add document fails
      await expect(
        asset.connect(signer_C).setDocument(documentName_1, "", documentHASH_1),
      ).to.be.revertedWithCustomError(asset, "EmptyURI");
    });

    it("GIVEN a document with no HASH WHEN setDocument THEN transaction fails with EmptyHASH", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_DOCUMENTER, signer_C.address);

      // add document fails
      await expect(
        asset
          .connect(signer_C)
          .setDocument(
            documentName_1,
            documentURI_1,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ),
      ).to.be.revertedWithCustomError(asset, "EmptyHASH");
    });

    it("GIVEN a document that does not exist WHEN removeDocument THEN transaction fails with DocumentDoesNotExist", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_DOCUMENTER, signer_C.address);

      // add document fails
      await expect(asset.connect(signer_C).removeDocument(documentName_1)).to.be.revertedWithCustomError(
        asset,
        "DocumentDoesNotExist",
      );
    });

    it("GIVEN an account with documenter role WHEN setDocument and removeDocument THEN transaction succeeds", async () => {
      // ADD TO LIST ------------------------------------------------------------------
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_DOCUMENTER, signer_C.address);

      // check that Document not in the list
      let documents = await asset.getAllDocuments();
      expect(documents.length).to.equal(0);

      // add document
      await expect(asset.connect(signer_C).setDocument(documentName_1, documentURI_1, documentHASH_1))
        .to.emit(asset, "DocumentUpdated")
        .withArgs(documentName_1, documentURI_1, documentHASH_1);
      await asset.connect(signer_C).setDocument(documentName_2, documentURI_2, documentHASH_2);

      // check documents
      documents = await asset.getAllDocuments();
      expect(documents.length).to.equal(2);
      expect(documents[0]).to.equal(documentName_1);
      const document = await asset.getDocument(documentName_1);
      expect(document[0]).to.equal(documentURI_1);
      expect(document[1]).to.equal(documentHASH_1);

      // REMOVE FROM LIST ------------------------------------------------------------------
      // remove From list
      await expect(asset.connect(signer_C).removeDocument(documentName_1))
        .to.emit(asset, "DocumentRemoved")
        .withArgs(documentName_1, documentURI_1, documentHASH_1);
      await asset.connect(signer_C).removeDocument(documentName_2);
      // check documents
      documents = await asset.getAllDocuments();
      expect(documents.length).to.equal(0);
    });

    it("GIVEN a document that is removed THEN docIndexes storage slot is zeroed (audit fix FIND-123)", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_DOCUMENTER, signer_C.address);

      await asset.connect(signer_C).setDocument(documentName_1, documentURI_1, documentHASH_1);
      await asset.connect(signer_C).removeDocument(documentName_1);

      // Compute storage slot for docIndexes[documentName_1].
      // DocumentationDataStorage struct layout from _DOCUMENTATION_STORAGE_POSITION:
      //   +0 documents, +1 docIndexes  ← mapping base slot, +2 docNames
      const DOCS_BASE = BigInt("0x1fc4fd526525f9824b2c5281c13f150dcad8151e0be556d609cf96360a80fe2a");
      const docIndexesMappingBaseSlot = DOCS_BASE + 1n;
      const ghostSlot = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "uint256"], [documentName_1, docIndexesMappingBaseSlot]),
      );

      const slotValue = await ethers.provider.getStorage(diamond.target, ghostSlot);
      expect(slotValue).to.equal(ethers.ZeroHash);
    });

    it("GIVEN an existing document WHEN setDocument is called again with same name THEN document is updated without adding to docNames array", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_DOCUMENTER, signer_C.address);

      // Add initial document
      await asset.connect(signer_C).setDocument(documentName_1, documentURI_1, documentHASH_1);

      // Verify document was added
      let documents = await asset.getAllDocuments();
      expect(documents.length).to.equal(1);
      expect(documents[0]).to.equal(documentName_1);

      // Get initial document details
      let document = await asset.getDocument(documentName_1);
      expect(document[0]).to.equal(documentURI_1);
      expect(document[1]).to.equal(documentHASH_1);

      // Update the same document with new URI and HASH
      await expect(asset.connect(signer_C).setDocument(documentName_1, documentURI_2, documentHASH_2))
        .to.emit(asset, "DocumentUpdated")
        .withArgs(documentName_1, documentURI_2, documentHASH_2);

      // Verify document list length is still 1 (not duplicated)
      documents = await asset.getAllDocuments();
      expect(documents.length).to.equal(1);
      expect(documents[0]).to.equal(documentName_1);

      // Verify document was updated with new values
      document = await asset.getDocument(documentName_1);
      expect(document[0]).to.equal(documentURI_2);
      expect(document[1]).to.equal(documentHASH_2);
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN setDocument THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(deployer).setDocument(ethers.ZeroHash, "", ethers.ZeroHash),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN removeDocument THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(deployer).removeDocument(ethers.ZeroHash)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("initializeDocumentation", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeDocumentation is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeDocumentation())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeDocumentation is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeDocumentation())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_DOCUMENTATION, 1);
      });
    });

    describe("initializeDocumentation event", () => {
      it("GIVEN a fresh deployment WHEN initializeDocumentation is called THEN emits DocumentationInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_DOCUMENTATION);
        await expect(asset.initializeDocumentation()).to.emit(asset, "DocumentationInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setDocument THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setDocument(ethers.ZeroHash, "", ethers.ZeroHash)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN removeDocument THEN reverts with AssetNotOperational", async () => {
        await expect(asset.removeDocument(ethers.ZeroHash)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
