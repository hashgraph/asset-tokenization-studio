import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type CorporateActionsSecurity,
    type Pause,
    type AccessControl,
} from '../../../../typechain-types'
import { deployEnvironment } from '../../../../scripts/deployEnvironmentByRpc'
import {
    _CORPORATE_ACTION_ROLE,
    _PAUSER_ROLE,
} from '../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { grantRoleAndPauseToken } from '../../../../scripts/testCommon'

const actionType =
    '0x000000000000000000000000000000000000000000000000000000000000aa23'
const actionData = '0x1234'
const corporateActionId_1 =
    '0x0000000000000000000000000000000000000000000000000000000000000001'

describe('Corporate Actions Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string

    let corporateActionsFacet: CorporateActionsSecurity
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
            RegulationType.REG_S,
            RegulationSubType.NONE,
            true,
            'ES,FR,CH',
            'nothing',
            init_rbacs
        )

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        corporateActionsFacet = await ethers.getContractAt(
            'CorporateActionsSecurity',
            diamond.address
        )

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    })

    it('GIVEN an account without corporateActions role WHEN addCorporateAction THEN transaction fails with AccountHasNoRole', async () => {
        // Using account C (non role)
        corporateActionsFacet = corporateActionsFacet.connect(signer_C)

        // add to list fails
        await expect(
            corporateActionsFacet.addCorporateAction(actionType, actionData)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN a paused Token WHEN addCorporateAction THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            _CORPORATE_ACTION_ROLE,
            signer_A,
            signer_B,
            account_C
        )

        // Using account C (with role)
        corporateActionsFacet = corporateActionsFacet.connect(signer_C)

        // add to list fails
        await expect(
            corporateActionsFacet.addCorporateAction(actionType, actionData)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN an account with corporateActions role WHEN addCorporateAction THEN transaction succeeds', async () => {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_CORPORATE_ACTION_ROLE, account_C)
        // Using account C (with role)
        corporateActionsFacet = corporateActionsFacet.connect(signer_C)

        // add to list
        await corporateActionsFacet.addCorporateAction(actionType, actionData)

        // check list members
        const listCount = await corporateActionsFacet.getCorporateActionCount()
        const listMembers = await corporateActionsFacet.getCorporateActionIds(
            0,
            listCount
        )
        const listCountByType =
            await corporateActionsFacet.getCorporateActionCountByType(
                actionType
            )
        const listMembersByType =
            await corporateActionsFacet.getCorporateActionIdsByType(
                actionType,
                0,
                listCount
            )
        const corporateAction = await corporateActionsFacet.getCorporateAction(
            corporateActionId_1
        )

        expect(listCount).to.equal(1)
        expect(listMembers.length).to.equal(listCount)
        expect(listMembers[0]).to.equal(corporateActionId_1)
        expect(listCountByType).to.equal(1)
        expect(listMembersByType.length).to.equal(listCountByType)
        expect(listMembersByType[0]).to.equal(corporateActionId_1)
        expect(corporateAction[0].toUpperCase()).to.equal(
            actionType.toUpperCase()
        )
        expect(corporateAction[1].toUpperCase()).to.equal(
            actionData.toUpperCase()
        )
    })
})
