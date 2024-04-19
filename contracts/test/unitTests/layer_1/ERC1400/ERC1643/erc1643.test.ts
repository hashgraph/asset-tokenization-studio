import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type ERC1643,
    type Pause,
    AccessControl,
} from '../../../../../typechain-types'
import { deployEnvironment } from '../../../../../scripts/deployEnvironmentByRpc'
import {
    _PAUSER_ROLE,
    _DOCUMENTER_ROLE,
} from '../../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { grantRoleAndPauseToken } from '../../../../../scripts/testCommon'

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
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string

    let erc1643Facet: ERC1643
    let accessControlFacet: AccessControl
    let pauseFacet: Pause

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B, signer_C] = await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address
        account_C = signer_C.address

        await deployEnvironment()

        const rbacPause: Rbac = {
            role: _PAUSER_ROLE,
            members: [account_B],
        }
        const init_rbacs: Rbac[] = [rbacPause]

        diamond = await deployEquityFromFactory(
            account_A,
            false,
            true,
            false,
            'TEST_AccessControl',
            'TAC',
            6,
            'ABCDEF123456',
            false,
            false,
            false,
            true,
            true,
            true,
            false,
            1,
            '0x345678',
            0,
            100,
            RegulationType.REG_D,
            RegulationSubType.REG_D_506_C,
            true,
            'ES,FR,CH',
            'nothing',
            init_rbacs
        )

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        erc1643Facet = await ethers.getContractAt('ERC1643', diamond.address)

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    })

    it('GIVEN an account without documenter role WHEN setDocument THEN transaction fails with AccountHasNoRole', async () => {
        // Using account C (non role)
        erc1643Facet = erc1643Facet.connect(signer_C)

        // add document fails
        await expect(
            erc1643Facet.setDocument(
                documentName_1,
                documentURI_1,
                documentHASH_1
            )
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without documenter role WHEN removeDocument THEN transaction fails with AccountHasNoRole', async () => {
        // Using account C (non role)
        erc1643Facet = erc1643Facet.connect(signer_C)

        // add document fails
        await expect(
            erc1643Facet.removeDocument(documentName_1)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN a paused Token WHEN setDocument THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            _DOCUMENTER_ROLE,
            signer_A,
            signer_B,
            account_C
        )

        // Using account C (with role)
        erc1643Facet = erc1643Facet.connect(signer_C)

        // add document fails
        await expect(
            erc1643Facet.setDocument(
                documentName_1,
                documentURI_1,
                documentHASH_1
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('GIVEN a paused Token WHEN removeDocument THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            _DOCUMENTER_ROLE,
            signer_A,
            signer_B,
            account_C
        )

        // Using account C (with role)
        erc1643Facet = erc1643Facet.connect(signer_C)

        // remove document
        await expect(
            erc1643Facet.removeDocument(documentName_1)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('GIVEN a document with no name WHEN setDocument THEN transaction fails with EmptyName', async () => {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_DOCUMENTER_ROLE, account_C)
        // Using account C (with role)
        erc1643Facet = erc1643Facet.connect(signer_C)

        // add document fails
        await expect(
            erc1643Facet.setDocument(
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                documentURI_1,
                documentHASH_1
            )
        ).to.be.rejectedWith('EmptyName')
    })

    it('GIVEN a document with no URI WHEN setDocument THEN transaction fails with EmptyURI', async () => {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_DOCUMENTER_ROLE, account_C)
        // Using account C (with role)
        erc1643Facet = erc1643Facet.connect(signer_C)

        // add document fails
        await expect(
            erc1643Facet.setDocument(documentName_1, '', documentHASH_1)
        ).to.be.rejectedWith('EmptyURI')
    })

    it('GIVEN a document with no HASH WHEN setDocument THEN transaction fails with EmptyHASH', async () => {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_DOCUMENTER_ROLE, account_C)
        // Using account C (with role)
        erc1643Facet = erc1643Facet.connect(signer_C)

        // add document fails
        await expect(
            erc1643Facet.setDocument(
                documentName_1,
                documentURI_1,
                '0x0000000000000000000000000000000000000000000000000000000000000000'
            )
        ).to.be.rejectedWith('EmptyHASH')
    })

    it('GIVEN a document that does not exist WHEN removeDocument THEN transaction fails with DocumentDoesNotExist', async () => {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_DOCUMENTER_ROLE, account_C)
        // Using account C (with role)
        erc1643Facet = erc1643Facet.connect(signer_C)

        // add document fails
        await expect(
            erc1643Facet.removeDocument(documentName_1)
        ).to.be.rejectedWith('DocumentDoesNotExist')
    })

    it('GIVEN an account with documenter role WHEN setDocument and removeDocument THEN transaction succeeds', async () => {
        // ADD TO LIST ------------------------------------------------------------------
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_DOCUMENTER_ROLE, account_C)
        // Using account C (with role)
        erc1643Facet = erc1643Facet.connect(signer_C)

        // check that Document not in the list
        let documents = await erc1643Facet.getAllDocuments()
        expect(documents.length).to.equal(0)

        // add document
        await expect(
            erc1643Facet.setDocument(
                documentName_1,
                documentURI_1,
                documentHASH_1
            )
        )
            .to.emit(erc1643Facet, 'DocumentUpdated')
            .withArgs(documentName_1, documentURI_1, documentHASH_1)
        await erc1643Facet.setDocument(
            documentName_2,
            documentURI_2,
            documentHASH_2
        )

        // check documents
        documents = await erc1643Facet.getAllDocuments()
        expect(documents.length).to.equal(2)
        expect(documents[0]).to.equal(documentName_1)
        const document = await erc1643Facet.getDocument(documentName_1)
        expect(document[0]).to.equal(documentURI_1)
        expect(document[1]).to.equal(documentHASH_1)

        // REMOVE FROM LIST ------------------------------------------------------------------
        // remove From list
        await expect(erc1643Facet.removeDocument(documentName_1))
            .to.emit(erc1643Facet, 'DocumentRemoved')
            .withArgs(documentName_1, documentURI_1, documentHASH_1)
        await erc1643Facet.removeDocument(documentName_2)
        // check documents
        documents = await erc1643Facet.getAllDocuments()
        expect(documents.length).to.equal(0)
    })
})
