import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import {
    type ResolverProxy,
    Pause,
    SsiManagement,
    MockedT3RevocationRegistry,
} from '@typechain'
import { ATS_ROLES } from '@scripts'
import { deployEquityTokenFixture } from '@test/fixtures'
import { executeRbac } from '@test/fixtures/tokens/common.fixture'

describe('SSI Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let pauseFacet: Pause
    let ssiManagementFacet: SsiManagement
    let revocationList: MockedT3RevocationRegistry

    async function deploySecurityFixture() {
        const base = await deployEquityTokenFixture()
        diamond = base.diamond
        signer_A = base.deployer
        signer_B = base.user2
        signer_C = base.user3

        await executeRbac(base.accessControlFacet, [
            {
                role: ATS_ROLES.PAUSER,
                members: [signer_A.address],
            },
            {
                role: ATS_ROLES.SSI_MANAGER,
                members: [signer_C.address],
            },
        ])
        pauseFacet = await ethers.getContractAt(
            'Pause',
            diamond.address,
            signer_A
        )
        ssiManagementFacet = await ethers.getContractAt(
            'SsiManagement',
            diamond.address,
            signer_C
        )
        revocationList = await (
            await ethers.getContractFactory(
                'MockedT3RevocationRegistry',
                signer_C
            )
        ).deploy()
        await revocationList.deployed()
    }

    beforeEach(async () => {
        await loadFixture(deploySecurityFixture)
    })

    describe('Paused', () => {
        beforeEach(async () => {
            // Pausing the token
            await pauseFacet.pause()
        })

        it('GIVEN a paused Token WHEN setRevocationRegistryAddress THEN transaction fails with TokenIsPaused', async () => {
            await expect(
                ssiManagementFacet.setRevocationRegistryAddress(
                    revocationList.address
                )
            ).to.be.revertedWithCustomError(ssiManagementFacet, 'TokenIsPaused')
        })

        it('GIVEN a paused Token WHEN addIssuer THEN transaction fails with TokenIsPaused', async () => {
            await expect(
                ssiManagementFacet.addIssuer(signer_B.address)
            ).to.be.revertedWithCustomError(ssiManagementFacet, 'TokenIsPaused')
        })

        it('GIVEN a paused Token WHEN removeIssuer THEN transaction fails with TokenIsPaused', async () => {
            await expect(
                ssiManagementFacet.removeIssuer(signer_B.address)
            ).to.be.revertedWithCustomError(ssiManagementFacet, 'TokenIsPaused')
        })
    })

    describe('Access Control', () => {
        it('GIVEN a non SSIManager account WHEN setRevocationRegistryAddress THEN transaction fails with AccountHasNoRole', async () => {
            await expect(
                ssiManagementFacet
                    .connect(signer_B)
                    .setRevocationRegistryAddress(revocationList.address)
            ).to.be.revertedWithCustomError(
                ssiManagementFacet,
                'AccountHasNoRole'
            )
        })

        it('GIVEN a non SSIManager account WHEN addIssuer THEN transaction fails with AccountHasNoRole', async () => {
            await expect(
                ssiManagementFacet.connect(signer_B).addIssuer(signer_B.address)
            ).to.be.revertedWithCustomError(
                ssiManagementFacet,
                'AccountHasNoRole'
            )
        })

        it('GIVEN a non SSIManager account WHEN removeIssuer THEN transaction fails with AccountHasNoRole', async () => {
            await expect(
                ssiManagementFacet
                    .connect(signer_B)
                    .removeIssuer(signer_B.address)
            ).to.be.revertedWithCustomError(
                ssiManagementFacet,
                'AccountHasNoRole'
            )
        })
    })

    describe('SsiManagement Wrong input data', () => {
        it('GIVEN listed issuer WHEN adding issuer THEN fails with ListedIssuer', async () => {
            await ssiManagementFacet.addIssuer(signer_B.address)

            await expect(
                ssiManagementFacet.addIssuer(signer_B.address)
            ).to.be.revertedWithCustomError(ssiManagementFacet, 'ListedIssuer')
        })

        it('GIVEN unlisted issuer WHEN removing issuer THEN fails with UnlistedIssuer', async () => {
            await expect(
                ssiManagementFacet.removeIssuer(signer_B.address)
            ).to.be.revertedWithCustomError(
                ssiManagementFacet,
                'UnlistedIssuer'
            )
        })
    })

    describe('SsiManagement OK', () => {
        it('GIVEN a revocationList WHEN setRevocationRegistryAddress THEN transaction succeed', async () => {
            expect(
                await ssiManagementFacet.setRevocationRegistryAddress(
                    revocationList.address
                )
            )
                .to.emit(ssiManagementFacet, 'RevocationRegistryAddressSet')
                .withArgs(ethers.constants.AddressZero, revocationList.address)

            const revocationListAddress =
                await ssiManagementFacet.getRevocationRegistryAddress()

            expect(revocationListAddress).to.equal(revocationList.address)
        })

        it('GIVEN an unlisted issuer WHEN addIssuer THEN transaction succeed', async () => {
            expect(
                await ssiManagementFacet.addIssuer(signer_B.address)
            ).to.emit(ssiManagementFacet, 'AddedToIssuerList')

            expect(
                await ssiManagementFacet.isIssuer(signer_B.address)
            ).to.equal(true)
            expect(await ssiManagementFacet.getIssuerListCount()).to.equal(1)

            const issuerList = await ssiManagementFacet.getIssuerListMembers(
                0,
                1
            )

            expect(issuerList).to.deep.equal([signer_B.address])
            expect(issuerList.length).to.equal(1)
        })

        it('GIVEN a listed issuer WHEN removeIssuer THEN transaction succeed', async () => {
            await ssiManagementFacet.addIssuer(signer_B.address)
            const issuerStatusBefore = await ssiManagementFacet.isIssuer(
                signer_B.address
            )
            const issuerListBefore =
                await ssiManagementFacet.getIssuerListMembers(0, 1)
            const issuerListCountBefore =
                await ssiManagementFacet.getIssuerListCount()

            expect(
                await ssiManagementFacet.removeIssuer(signer_B.address)
            ).to.emit(ssiManagementFacet, 'RemovedFromIssuerList')

            expect(issuerStatusBefore).to.equal(true)
            expect(
                await ssiManagementFacet.isIssuer(signer_B.address)
            ).to.equal(false)
            expect(issuerListCountBefore).to.equal(1)
            expect(await ssiManagementFacet.getIssuerListCount()).to.equal(0)
            expect(issuerListBefore.length).to.equal(1)
            expect(issuerListBefore).to.deep.equal([signer_B.address])
            expect(
                await ssiManagementFacet.getIssuerListMembers(0, 1)
            ).to.deep.equal([])
        })
    })
})
