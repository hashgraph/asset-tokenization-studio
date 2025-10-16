import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { GAS_LIMIT, ATS_ROLES } from '@scripts'
import { grantRoleAndPauseToken } from '@test/common'
import { deployEquityTokenFixture } from '@test/fixtures'
import {
    PauseFacet,
    AccessControl,
    ResolverProxy,
    MockedExternalPause,
} from '@typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Signer } from 'ethers'
import { ethers } from 'hardhat'

describe('Pause Tests', () => {
    let diamond: ResolverProxy
    let pauseFacet: PauseFacet
    let accessControlFacet: AccessControl
    let deployer: SignerWithAddress
    let unknownSigner: Signer
    let externalPauseMock: MockedExternalPause

    // Fixture: Deploy equity token with external pause mock
    async function deployEquityWithExternalPauseFixture() {
        const base = await deployEquityTokenFixture()
        diamond = base.diamond

        // Deploy mock external pause contract
        externalPauseMock = await (
            await ethers.getContractFactory(
                'MockedExternalPause',
                base.deployer
            )
        ).deploy({ gasLimit: GAS_LIMIT.high })
        await externalPauseMock.deployed()

        // Get external pause management facet
        const externalPauseManagement = await ethers.getContractAt(
            'ExternalPauseManagement',
            diamond.address,
            base.deployer
        )

        // Add external pause to the token
        await base.accessControlFacet.grantRole(
            ATS_ROLES.PAUSER,
            base.deployer.address
        )
        await base.accessControlFacet.grantRole(
            ATS_ROLES.PAUSE_MANAGER,
            base.deployer.address
        )
        await externalPauseManagement.addExternalPause(
            externalPauseMock.address,
            {
                gasLimit: GAS_LIMIT.high,
            }
        )

        pauseFacet = base.pauseFacet
        deployer = base.deployer
        unknownSigner = base.unknownSigner
        accessControlFacet = base.accessControlFacet
    }

    // Pre-load fixture to separate deployment time from test execution time
    beforeEach(async () => {
        await loadFixture(deployEquityWithExternalPauseFixture)
    })

    it('GIVEN an account without pause role WHEN pause THEN transaction fails with AccountHasNoRole', async () => {
        await expect(
            pauseFacet.connect(unknownSigner).pause()
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without pause role WHEN unpause THEN transaction fails with AccountHasNoRole', async () => {
        await expect(
            pauseFacet.connect(unknownSigner).unpause()
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN a paused Token WHEN pause THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            ATS_ROLES.PAUSER,
            deployer,
            unknownSigner,
            await unknownSigner.getAddress()
        )

        // pause fails
        await expect(
            pauseFacet.connect(unknownSigner).pause()
        ).to.be.revertedWithCustomError(pauseFacet, 'TokenIsPaused')
    })

    it('GIVEN an unpause Token WHEN unpause THEN transaction fails with TokenIsUnpaused', async () => {
        await accessControlFacet
            .connect(deployer)
            .grantRole(ATS_ROLES.PAUSER, await unknownSigner.getAddress())

        // unpause fails
        await expect(
            pauseFacet.connect(unknownSigner).unpause()
        ).to.be.revertedWithCustomError(pauseFacet, 'TokenIsUnpaused')
    })

    it('GIVEN an account with pause role WHEN pause and unpause THEN transaction succeeds', async () => {
        // Granting Role
        await accessControlFacet
            .connect(deployer)
            .grantRole(ATS_ROLES.PAUSER, await unknownSigner.getAddress())

        // PAUSE
        await expect(pauseFacet.connect(unknownSigner).pause())
            .to.emit(pauseFacet, 'TokenPaused')
            .withArgs(await unknownSigner.getAddress())

        let paused = await pauseFacet.isPaused()
        expect(paused).to.be.equal(true)

        // UNPAUSE
        await expect(pauseFacet.connect(unknownSigner).unpause())
            .to.emit(pauseFacet, 'TokenUnpaused')
            .withArgs(await unknownSigner.getAddress())

        paused = await pauseFacet.isPaused()
        expect(paused).to.be.equal(false)
    })

    it('GIVEN an external pause WHEN isPaused THEN it reflects the external pause state', async () => {
        // Initially unpaused
        let isPaused = await pauseFacet.isPaused()
        expect(isPaused).to.be.false

        // Set external pause to true
        await externalPauseMock.setPaused(true)
        isPaused = await pauseFacet.isPaused()
        expect(isPaused).to.be.true

        // Set external pause to false
        await externalPauseMock.setPaused(false, {
            gasLimit: GAS_LIMIT.default,
        })
        isPaused = await pauseFacet.isPaused()
        expect(isPaused).to.be.false
    })

    it('GIVEN an external pause WHEN token is paused THEN isPaused returns true', async () => {
        // Pause the token
        await pauseFacet.pause()

        // Check isPaused
        const isPaused = await pauseFacet.isPaused()
        expect(isPaused).to.be.true
    })

    it('GIVEN an external pause WHEN token is unpaused THEN isPaused reflects external pause state', async () => {
        // Pause and then unpause the token
        await pauseFacet.pause()
        await pauseFacet.unpause()

        // Set external pause to true
        await externalPauseMock.setPaused(true)
        let isPaused = await pauseFacet.isPaused()
        expect(isPaused).to.be.true

        // Set external pause to false
        await externalPauseMock.setPaused(false, {
            gasLimit: GAS_LIMIT.default,
        })
        isPaused = await pauseFacet.isPaused()
        expect(isPaused).to.be.false
    })
})
