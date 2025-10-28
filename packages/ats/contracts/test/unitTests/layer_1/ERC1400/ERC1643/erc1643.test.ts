import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    type ResolverProxy,
    type ERC1643,
    type Pause,
    AccessControl,
} from '@contract-types'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { grantRoleAndPauseToken } from '../../../../common'
import { deployEquityTokenFixture } from '@test'
import { executeRbac } from '@test'
import { ATS_ROLES } from '@scripts'

const documentName_1 =
    '0x000000000000000000000000000000000000000000000000000000000000aa23'
const documentName_2 =
    '0x000000000000000000000000000000000000000000000000000000000000bb23'
const documentURI_1 = 'https://whatever.com'
const documentHASH_1 =
    '0x000000000000000000000000000000000000000000000000000000000000cc32'
const documentURI_2 = 'https://whatever2.com'
const documentHASH_2 =
    '0x000000000000000000000000000000000000000000000000000000000002cc32'

describe('ERC1643 Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let erc1643Facet: ERC1643
    let accessControlFacet: AccessControl
    let pauseFacet: Pause

    async function deploySecurityTokenFixture() {
        const base = await deployEquityTokenFixture()
        diamond = base.diamond
        signer_A = base.deployer
        signer_B = base.user1
        signer_C = base.user2
        await executeRbac(base.accessControlFacet, [
            {
                role: ATS_ROLES._PAUSER_ROLE,
                members: [signer_B.address],
            },
        ])

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        erc1643Facet = await ethers.getContractAt('ERC1643', diamond.address)

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    }

    beforeEach(async () => {
        await loadFixture(deploySecurityTokenFixture)
    })

    it('GIVEN an account without documenter role WHEN setDocument THEN transaction fails with AccountHasNoRole', async () => {
        // add document fails
        await expect(
            erc1643Facet
                .connect(signer_C)
                .setDocument(documentName_1, documentURI_1, documentHASH_1)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without documenter role WHEN removeDocument THEN transaction fails with AccountHasNoRole', async () => {
        // add document fails
        await expect(
            erc1643Facet.connect(signer_C).removeDocument(documentName_1)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN a paused Token WHEN setDocument THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            ATS_ROLES._DOCUMENTER_ROLE,
            signer_A,
            signer_B,
            signer_C.address
        )

        // add document fails
        await expect(
            erc1643Facet
                .connect(signer_C)
                .setDocument(documentName_1, documentURI_1, documentHASH_1)
        ).to.be.revertedWithCustomError(erc1643Facet, 'TokenIsPaused')
    })

    it('GIVEN a paused Token WHEN removeDocument THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            ATS_ROLES._DOCUMENTER_ROLE,
            signer_A,
            signer_B,
            signer_C.address
        )

        // remove document
        await expect(
            erc1643Facet.connect(signer_C).removeDocument(documentName_1)
        ).to.be.revertedWithCustomError(erc1643Facet, 'TokenIsPaused')
    })

    it('GIVEN a document with no name WHEN setDocument THEN transaction fails with EmptyName', async () => {
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES._DOCUMENTER_ROLE, signer_C.address)

        // add document fails
        await expect(
            erc1643Facet
                .connect(signer_C)
                .setDocument(
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    documentURI_1,
                    documentHASH_1
                )
        ).to.be.rejectedWith('EmptyName')
    })

    it('GIVEN a document with no URI WHEN setDocument THEN transaction fails with EmptyURI', async () => {
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES._DOCUMENTER_ROLE, signer_C.address)
        // add document fails
        await expect(
            erc1643Facet
                .connect(signer_C)
                .setDocument(documentName_1, '', documentHASH_1)
        ).to.be.rejectedWith('EmptyURI')
    })

    it('GIVEN a document with no HASH WHEN setDocument THEN transaction fails with EmptyHASH', async () => {
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES._DOCUMENTER_ROLE, signer_C.address)

        // add document fails
        await expect(
            erc1643Facet
                .connect(signer_C)
                .setDocument(
                    documentName_1,
                    documentURI_1,
                    '0x0000000000000000000000000000000000000000000000000000000000000000'
                )
        ).to.be.rejectedWith('EmptyHASH')
    })

    it('GIVEN a document that does not exist WHEN removeDocument THEN transaction fails with DocumentDoesNotExist', async () => {
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES._DOCUMENTER_ROLE, signer_C.address)

        // add document fails
        await expect(
            erc1643Facet.connect(signer_C).removeDocument(documentName_1)
        ).to.be.rejectedWith('DocumentDoesNotExist')
    })

    it('GIVEN an account with documenter role WHEN setDocument and removeDocument THEN transaction succeeds', async () => {
        // ADD TO LIST ------------------------------------------------------------------
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES._DOCUMENTER_ROLE, signer_C.address)

        // check that Document not in the list
        let documents = await erc1643Facet.getAllDocuments()
        expect(documents.length).to.equal(0)

        // add document
        await expect(
            erc1643Facet
                .connect(signer_C)
                .setDocument(documentName_1, documentURI_1, documentHASH_1)
        )
            .to.emit(erc1643Facet, 'DocumentUpdated')
            .withArgs(documentName_1, documentURI_1, documentHASH_1)
        await erc1643Facet
            .connect(signer_C)
            .setDocument(documentName_2, documentURI_2, documentHASH_2)

        // check documents
        documents = await erc1643Facet.getAllDocuments()
        expect(documents.length).to.equal(2)
        expect(documents[0]).to.equal(documentName_1)
        const document = await erc1643Facet.getDocument(documentName_1)
        expect(document[0]).to.equal(documentURI_1)
        expect(document[1]).to.equal(documentHASH_1)

        // REMOVE FROM LIST ------------------------------------------------------------------
        // remove From list
        await expect(
            erc1643Facet.connect(signer_C).removeDocument(documentName_1)
        )
            .to.emit(erc1643Facet, 'DocumentRemoved')
            .withArgs(documentName_1, documentURI_1, documentHASH_1)
        await erc1643Facet.connect(signer_C).removeDocument(documentName_2)
        // check documents
        documents = await erc1643Facet.getAllDocuments()
        expect(documents.length).to.equal(0)
    })
})
