import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Pause,
    AccessControl,
} from '../../../../typechain-types'
import { deployEnvironment } from '../../../../scripts/deployEnvironmentByRpc'
import { _PAUSER_ROLE } from '../../../../scripts/constants'
import {
    deployEquityFromFactory,
    RegulationSubType,
    RegulationType,
} from '../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { grantRoleAndPauseToken } from '../../../../scripts/testCommon'

describe('Pause Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress

    let account_A: string
    let account_B: string

    let accessControlFacet: AccessControl
    let pauseFacet: Pause

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B] = await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address

        await deployEnvironment()

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
            'nothing'
        )

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    })

    it('GIVEN an account without pause role WHEN pause THEN transaction fails with AccountHasNoRole', async () => {
        // Using account B (non role)
        pauseFacet = pauseFacet.connect(signer_B)

        // pause fails
        await expect(pauseFacet.pause()).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without pause role WHEN unpause THEN transaction fails with AccountHasNoRole', async () => {
        // Using account B (non role)
        pauseFacet = pauseFacet.connect(signer_B)

        // unpause fails
        await expect(pauseFacet.unpause()).to.be.rejectedWith(
            'AccountHasNoRole'
        )
    })

    it('GIVEN a paused Token WHEN pause THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            _PAUSER_ROLE,
            signer_A,
            signer_B,
            account_B
        )

        // pause fails
        pauseFacet = pauseFacet.connect(signer_B)
        await expect(pauseFacet.pause()).to.eventually.be.rejectedWith(Error)
    })

    it('GIVEN an unpause Token WHEN unpause THEN transaction fails with TokenIsUnpaused', async () => {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_PAUSER_ROLE, account_B)
        pauseFacet = pauseFacet.connect(signer_B)

        // unpause fails
        await expect(pauseFacet.unpause()).to.eventually.be.rejectedWith(Error)
    })

    it('GIVEN an account with pause role WHEN pause and unpause THEN transaction succeeds', async () => {
        // PAUSE ------------------------------------------------------------------
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_PAUSER_ROLE, account_B)
        // Pausing the token
        pauseFacet = pauseFacet.connect(signer_B)

        await expect(pauseFacet.pause())
            .to.emit(pauseFacet, 'TokenPaused')
            .withArgs(account_B)
        // check is paused
        let paused = await pauseFacet.isPaused()
        expect(paused).to.be.equal(true)

        // UNPAUSE ------------------------------------------------------------------
        // remove From list
        await expect(pauseFacet.unpause())
            .to.emit(pauseFacet, 'TokenUnpaused')
            .withArgs(account_B)
        // check is unpaused
        paused = await pauseFacet.isPaused()
        expect(paused).to.be.equal(false)
    })
})
