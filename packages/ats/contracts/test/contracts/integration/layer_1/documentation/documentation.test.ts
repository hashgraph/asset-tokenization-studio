// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { grantRoleAndPauseToken } from "../../../../common";
import { deployEquityTokenFixture } from "@test";
import { executeRbac } from "@test";
import { ATS_ROLES } from "@scripts";

const documentName_1 = "0x000000000000000000000000000000000000000000000000000000000000aa23";
const documentName_2 = "0x000000000000000000000000000000000000000000000000000000000000bb23";
const documentURI_1 = "https://whatever.com";
const documentHASH_1 = "0x000000000000000000000000000000000000000000000000000000000000cc32";
const documentURI_2 = "https://whatever2.com";
const documentHASH_2 = "0x000000000000000000000000000000000000000000000000000000000002cc32";

describe("Documentation Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityTokenFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityTokenFixture);
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

  it("GIVEN a paused Token WHEN setDocument THEN transaction fails with TokenIsPaused", async () => {
    // Granting Role to account C and Pause
    await grantRoleAndPauseToken(asset, ATS_ROLES.DOCUMENTER_ROLE, signer_A, signer_B, signer_C.address);

    // add document fails
    await expect(
      asset.connect(signer_C).setDocument(documentName_1, documentURI_1, documentHASH_1),
    ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
  });

  it("GIVEN a paused Token WHEN removeDocument THEN transaction fails with TokenIsPaused", async () => {
    // Granting Role to account C and Pause
    await grantRoleAndPauseToken(asset, ATS_ROLES.DOCUMENTER_ROLE, signer_A, signer_B, signer_C.address);

    // remove document
    await expect(asset.connect(signer_C).removeDocument(documentName_1)).to.be.revertedWithCustomError(
      asset,
      "TokenIsPaused",
    );
  });

  it("GIVEN a document with no name WHEN setDocument THEN transaction fails with EmptyName", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.DOCUMENTER_ROLE, signer_C.address);

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
    await asset.connect(signer_A).grantRole(ATS_ROLES.DOCUMENTER_ROLE, signer_C.address);
    // add document fails
    await expect(asset.connect(signer_C).setDocument(documentName_1, "", documentHASH_1)).to.be.revertedWithCustomError(
      asset,
      "EmptyURI",
    );
  });

  it("GIVEN a document with no HASH WHEN setDocument THEN transaction fails with EmptyHASH", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.DOCUMENTER_ROLE, signer_C.address);

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
    await asset.connect(signer_A).grantRole(ATS_ROLES.DOCUMENTER_ROLE, signer_C.address);

    // add document fails
    await expect(asset.connect(signer_C).removeDocument(documentName_1)).to.be.revertedWithCustomError(
      asset,
      "DocumentDoesNotExist",
    );
  });

  it("GIVEN an account with documenter role WHEN setDocument and removeDocument THEN transaction succeeds", async () => {
    // ADD TO LIST ------------------------------------------------------------------
    await asset.connect(signer_A).grantRole(ATS_ROLES.DOCUMENTER_ROLE, signer_C.address);

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

  it("GIVEN an existing document WHEN setDocument is called again with same name THEN document is updated without adding to docNames array", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.DOCUMENTER_ROLE, signer_C.address);

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
});
