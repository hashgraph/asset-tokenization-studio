import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type ControlList,
    type Pause,
    AccessControl,
} from '../../../../typechain-types'
import { deployEnvironment } from '../../../../scripts/deployEnvironmentByRpc'
import { _CONTROL_LIST_ROLE, _PAUSER_ROLE } from '../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { grantRoleAndPauseToken } from '../../../../scripts/testCommon'

describe('Control List Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let signer_D: SignerWithAddress
    let signer_E: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string
    let account_D: string
    let account_E: string

    let controlListFacet: ControlList
    let accessControlFacet: AccessControl
    let pauseFacet: Pause

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B, signer_C, signer_D, signer_E] =
            await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address
        account_C = signer_C.address
        account_D = signer_D.address
        account_E = signer_E.address

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

        controlListFacet = await ethers.getContractAt(
            'ControlList',
            diamond.address
        )

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    })

    it('GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized', async () => {
        await expect(
            controlListFacet.initialize_ControlList(true)
        ).to.be.rejectedWith('AlreadyInitialized')
    })

    it('GIVEN an account without controlList role WHEN addToControlList THEN transaction fails with AccountHasNoRole', async () => {
        // Using account C (non role)
        controlListFacet = controlListFacet.connect(signer_C)

        // add to list fails
        await expect(
            controlListFacet.addToControlList(account_D)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without controlList role WHEN removeFromControlList THEN transaction fails with AccountHasNoRole', async () => {
        // Using account C (non role)
        controlListFacet = controlListFacet.connect(signer_C)

        // remove From list fails
        await expect(
            controlListFacet.removeFromControlList(account_D)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN a paused Token WHEN addToControlList THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            _CONTROL_LIST_ROLE,
            signer_A,
            signer_B,
            account_C
        )

        // Using account C (with role)
        controlListFacet = controlListFacet.connect(signer_C)

        // add to list fails
        await expect(
            controlListFacet.addToControlList(account_D)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN a paused Token WHEN removeFromControlList THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            _CONTROL_LIST_ROLE,
            signer_A,
            signer_B,
            account_C
        )

        // Using account C (with role)
        controlListFacet = controlListFacet.connect(signer_C)

        // remove from list fails
        await expect(
            controlListFacet.removeFromControlList(account_D)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN an account with controlList role WHEN addToControlList and removeFromControlList THEN transaction succeeds', async () => {
        // ADD TO LIST ------------------------------------------------------------------
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_CONTROL_LIST_ROLE, account_C)
        // Using account C (with role)
        controlListFacet = controlListFacet.connect(signer_C)

        // check that D and E are not in the list
        let check_D = await controlListFacet.isInControlList(account_D)
        expect(check_D).to.equal(false)
        let check_E = await controlListFacet.isInControlList(account_E)
        expect(check_E).to.equal(false)

        // add to list
        await expect(controlListFacet.addToControlList(account_D))
            .to.emit(controlListFacet, 'AddedToControlList')
            .withArgs(account_C, account_D)
        await expect(controlListFacet.addToControlList(account_E))
            .to.emit(controlListFacet, 'AddedToControlList')
            .withArgs(account_C, account_E)

        // check that D and E are in the list
        check_D = await controlListFacet.isInControlList(account_D)
        expect(check_D).to.equal(true)
        check_E = await controlListFacet.isInControlList(account_E)
        expect(check_E).to.equal(true)
        // check list members
        let listCount = await controlListFacet.getControlListCount()
        let listMembers = await controlListFacet.getControlListMembers(
            0,
            listCount
        )

        expect(listCount).to.equal(2)
        expect(listMembers.length).to.equal(listCount)
        expect(listMembers[0].toUpperCase()).to.equal(account_D.toUpperCase())
        expect(listMembers[1].toUpperCase()).to.equal(account_E.toUpperCase())

        // REMOVE FROM LIST ------------------------------------------------------------------
        // remove From list
        await expect(controlListFacet.removeFromControlList(account_D))
            .to.emit(controlListFacet, 'RemovedFromControlList')
            .withArgs(account_C, account_D)

        // check that D is not in the list
        check_D = await controlListFacet.isInControlList(account_D)
        expect(check_D).to.equal(false)

        // check list members
        listCount = await controlListFacet.getControlListCount()
        listMembers = await controlListFacet.getControlListMembers(0, listCount)

        expect(listCount).to.equal(1)
        expect(listMembers.length).to.equal(listCount)
        expect(listMembers[0].toUpperCase()).to.equal(account_E.toUpperCase())

        // CHECK LIST TYPE ------------------------------------------------------------------
        const listType = await controlListFacet.getControlListType()
        expect(listType).to.equal(false)
    })
})
