import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployEquityTokenFixture } from '@test/fixtures'
import { executeRbac } from '@test/fixtures/tokens/common.fixture'
import { ATS_ROLES, ADDRESS_ZERO } from '@scripts'
import {
    ResolverProxy,
    Kyc,
    Pause,
    SsiManagement,
    ExternalKycListManagement,
    MockedT3RevocationRegistry,
    MockedExternalKycList,
    TimeTravelFacet,
} from '@typechain'

const _VALID_FROM = 0
const _VALID_TO = 99999999999999
const _VC_ID = 'VC_24'

describe('Kyc Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let signer_D: SignerWithAddress

    let kycFacet: Kyc
    let pauseFacet: Pause
    let ssiManagementFacet: SsiManagement
    let externalKycListManagement: ExternalKycListManagement
    let revocationList: MockedT3RevocationRegistry
    let externalKycListMock: MockedExternalKycList
    let timeTravelFacet: TimeTravelFacet

    let currentTimestamp = 0

    async function deploySecurityFixture() {
        const base = await deployEquityTokenFixture()
        diamond = base.diamond
        signer_A = base.deployer
        signer_B = base.user1
        signer_C = base.user2
        signer_D = base.user3

        await executeRbac(base.accessControlFacet, [
            {
                role: ATS_ROLES.KYC,
                members: [signer_A.address],
            },
            {
                role: ATS_ROLES.INTERNAL_KYC_MANAGER,
                members: [signer_A.address],
            },
            {
                role: ATS_ROLES.KYC_MANAGER,
                members: [signer_A.address],
            },
            {
                role: ATS_ROLES.PAUSER,
                members: [signer_A.address],
            },
            {
                role: ATS_ROLES.SSI_MANAGER,
                members: [signer_C.address],
            },
        ])
        kycFacet = await ethers.getContractAt('Kyc', diamond.address, signer_A)
        externalKycListManagement = await ethers.getContractAt(
            'ExternalKycListManagement',
            diamond.address,
            signer_A
        )
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
        timeTravelFacet = await ethers.getContractAt(
            'TimeTravelFacet',
            diamond.address,
            signer_A
        )

        revocationList = await (
            await ethers.getContractFactory(
                'MockedT3RevocationRegistry',
                signer_C
            )
        ).deploy()
        await revocationList.deployed()

        externalKycListMock = await (
            await ethers.getContractFactory('MockedExternalKycList', signer_C)
        ).deploy()
        await externalKycListMock.deployed()

        await ssiManagementFacet.addIssuer(signer_C.address)
        await ssiManagementFacet.setRevocationRegistryAddress(
            revocationList.address
        )
    }

    beforeEach(async () => {
        await loadFixture(deploySecurityFixture)
        currentTimestamp = (await ethers.provider.getBlock('latest')).timestamp
    })

    describe('Paused', () => {
        beforeEach(async () => {
            await pauseFacet.pause()
        })

        it('GIVEN a paused Token WHEN grantKyc THEN transaction fails with TokenIsPaused', async () => {
            await expect(
                kycFacet.grantKyc(
                    signer_B.address,
                    _VC_ID,
                    _VALID_FROM,
                    _VALID_TO,
                    signer_C.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'TokenIsPaused')
        })

        it('GIVEN a paused Token WHEN revokeKyc THEN transaction fails with TokenIsPaused', async () => {
            await expect(
                kycFacet.revokeKyc(signer_B.address)
            ).to.be.revertedWithCustomError(kycFacet, 'TokenIsPaused')
        })
    })

    describe('Access Control', () => {
        it('GIVEN a non Kyc account WHEN grantKyc THEN transaction fails with AccountHasNoRole', async () => {
            await expect(
                kycFacet
                    .connect(signer_C)
                    .grantKyc(
                        signer_B.address,
                        _VC_ID,
                        _VALID_FROM,
                        _VALID_TO,
                        signer_C.address
                    )
            ).to.be.revertedWithCustomError(kycFacet, 'AccountHasNoRole')
        })

        it('GIVEN a paused Token WHEN revokeKyc THEN transaction fails with AccountHasNoRole', async () => {
            await expect(
                kycFacet.connect(signer_C).revokeKyc(signer_B.address)
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN an account without ATS_ROLES.INTERNAL_KYC_MANAGER WHEN activating internal kyc THEN it reverts with AccountHasNoRole', async () => {
            await expect(
                kycFacet.connect(signer_C).activateInternalKyc()
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN an account without ATS_ROLES.INTERNAL_KYC_MANAGER WHEN deactivating internal kyc THEN it reverts with AccountHasNoRole', async () => {
            await expect(
                kycFacet.connect(signer_C).deactivateInternalKyc()
            ).to.be.rejectedWith('AccountHasNoRole')
        })
    })

    describe('Kyc Valid Status Modifier Tests (onlyValidKycStatus)', () => {
        it('GIVEN internal KYC is deactivated WHEN grantKyc is called THEN KYC status is updated successfully', async () => {
            await kycFacet.deactivateInternalKyc()

            const KycStatusFor_B_Before = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KycStatusFor_B_After = await kycFacet.getKycStatusFor(
                signer_B.address
            )
            expect(KycStatusFor_B_Before).to.equal(0)
            expect(KycStatusFor_B_After).to.equal(1)
        })

        it('GIVEN internal KYC is active AND KYC is already granted WHEN grantKyc is called again THEN it reverts with InvalidKycStatus', async () => {
            const KycStatusFor_B_Before = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KycStatusFor_B_After = await kycFacet.getKycStatusFor(
                signer_B.address
            )
            expect(KycStatusFor_B_Before).to.equal(0)
            expect(KycStatusFor_B_After).to.equal(1)
            await expect(
                kycFacet.grantKyc(
                    signer_B.address,
                    _VC_ID,
                    _VALID_FROM,
                    _VALID_TO,
                    signer_C.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')
        })

        it('GIVEN internal KYC is deactivated AND external KYC has different status WHEN grantKyc is called THEN it reverts with InvalidKycStatus', async () => {
            await kycFacet.deactivateInternalKyc()
            await externalKycListManagement.addExternalKycList(
                externalKycListMock.address
            )
            await externalKycListMock.grantKyc(signer_B.address)
            await expect(
                kycFacet.grantKyc(
                    signer_B.address,
                    _VC_ID,
                    _VALID_FROM,
                    _VALID_TO,
                    signer_C.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')
        })

        it('GIVEN internal KYC is deactivated AND external KYC status matches WHEN grantKyc is called THEN KYC status is updated successfully', async () => {
            await kycFacet.deactivateInternalKyc()
            await externalKycListManagement.addExternalKycList(
                externalKycListMock.address
            )
            const KycStatusFor_B_Before = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KycStatusFor_B_After = await kycFacet.getKycStatusFor(
                signer_B.address
            )
            expect(KycStatusFor_B_Before).to.equal(0)
            expect(KycStatusFor_B_After).to.equal(1)
        })

        it('GIVEN internal KYC is active AND external KYC has different status WHEN grantKyc is called THEN it reverts with InvalidKycStatus', async () => {
            await externalKycListManagement.addExternalKycList(
                externalKycListMock.address
            )
            await externalKycListMock.grantKyc(signer_B.address)
            await expect(
                kycFacet.grantKyc(
                    signer_B.address,
                    _VC_ID,
                    _VALID_FROM,
                    _VALID_TO,
                    signer_C.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')
        })
        it('GIVEN internal KYC is active AND external KYC status matches WHEN grantKyc is called THEN KYC status is updated successfully', async () => {
            await externalKycListManagement.addExternalKycList(
                externalKycListMock.address
            )
            const KycStatusFor_B_Before = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KycStatusFor_B_After = await kycFacet.getKycStatusFor(
                signer_B.address
            )
            expect(KycStatusFor_B_Before).to.equal(0)
            expect(KycStatusFor_B_After).to.equal(1)
        })
        it('GIVEN internal KYC is active AND external KYC status matches WHEN grantKyc is called twice THEN second call reverts with InvalidKycStatus', async () => {
            await externalKycListManagement.addExternalKycList(
                externalKycListMock.address
            )
            const KycStatusFor_B_Before = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KycStatusFor_B_After = await kycFacet.getKycStatusFor(
                signer_B.address
            )
            expect(KycStatusFor_B_Before).to.equal(0)
            expect(KycStatusFor_B_After).to.equal(1)
            await expect(
                kycFacet.grantKyc(
                    signer_B.address,
                    _VC_ID,
                    _VALID_FROM,
                    _VALID_TO,
                    signer_C.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')
        })
        it('GIVEN internal KYC is active AND external KYC is granted after internal grant WHEN grantKyc is called again THEN it reverts with InvalidKycStatus', async () => {
            await externalKycListManagement.addExternalKycList(
                externalKycListMock.address
            )
            const KycStatusFor_B_Before = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KycStatusFor_B_After = await kycFacet.getKycStatusFor(
                signer_B.address
            )
            expect(KycStatusFor_B_Before).to.equal(0)
            expect(KycStatusFor_B_After).to.equal(1)

            await externalKycListMock.grantKyc(signer_B.address)

            await expect(
                kycFacet.grantKyc(
                    signer_B.address,
                    _VC_ID,
                    _VALID_FROM,
                    _VALID_TO,
                    signer_C.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')
        })
    })

    describe('Kyc Wrong input data', () => {
        it('GIVEN account ZERO WHEN grantKyc THEN transaction fails with ZeroAddressNotAllowed', async () => {
            await expect(
                kycFacet.grantKyc(
                    ADDRESS_ZERO,
                    _VC_ID,
                    _VALID_FROM,
                    _VALID_TO,
                    signer_C.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'ZeroAddressNotAllowed')
        })

        it('GIVEN account ZERO WHEN revokeKyc THEN transaction fails with ZeroAddressNotAllowed', async () => {
            await expect(
                kycFacet.revokeKyc(ADDRESS_ZERO)
            ).to.be.revertedWithCustomError(kycFacet, 'ZeroAddressNotAllowed')
        })

        it('GIVEN wrong Valid From Date WHEN grantKyc THEN transaction fails with InvalidDates', async () => {
            await expect(
                kycFacet.grantKyc(
                    signer_B.address,
                    _VC_ID,
                    _VALID_TO + 1,
                    _VALID_TO,
                    signer_C.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'InvalidDates')
        })

        it('GIVEN wrong Valid To Date WHEN grantKyc THEN transaction fails with InvalidDates', async () => {
            await expect(
                kycFacet.grantKyc(
                    signer_B.address,
                    _VC_ID,
                    _VALID_FROM,
                    currentTimestamp - 1,
                    signer_C.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'InvalidDates')
        })

        it('GIVEN wrong issuer WHEN grantKyc THEN transaction fails with AccountIsNotIssuer', async () => {
            await expect(
                kycFacet.grantKyc(
                    signer_B.address,
                    _VC_ID,
                    _VALID_FROM,
                    _VALID_TO,
                    signer_D.address
                )
            ).to.be.revertedWithCustomError(kycFacet, 'AccountIsNotIssuer')
        })
    })

    describe('Kyc OK', () => {
        it('GIVEN a VC WHEN grantKyc THEN transaction succeed', async () => {
            const KYCStatusFor_B_Before = await kycFacet.getKycStatusFor(
                signer_B.address
            )
            const KYC_Count_Before = await kycFacet.getKycAccountsCount(1)

            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KYCStatusFor_B_After = await kycFacet.getKycStatusFor(
                signer_B.address
            )
            const KYC_Count_After = await kycFacet.getKycAccountsCount(1)
            const KYCSFor_B = await kycFacet.getKycFor(signer_B.address)
            const [kycAccounts, kycAccountsData_After] =
                await kycFacet.getKycAccountsData(1, 0, 1)

            expect(KYCStatusFor_B_Before).to.equal(0)
            expect(KYCStatusFor_B_After).to.equal(1)
            expect(KYC_Count_Before).to.equal(0)
            expect(KYC_Count_After).to.equal(1)
            expect(kycAccounts.length).to.equal(1)
            expect(kycAccounts[0]).to.equal(signer_B.address)
            expect(KYCSFor_B.validFrom).to.equal(_VALID_FROM)
            expect(KYCSFor_B.validTo).to.equal(_VALID_TO)
            expect(KYCSFor_B.issuer).to.equal(signer_C.address)
            expect(KYCSFor_B.vcId).to.equal(_VC_ID)
            expect(kycAccountsData_After[0].status).to.equal(1)
            expect(kycAccountsData_After.length).to.equal(1)
        })

        it('GIVEN a VC WHEN revokeKyc THEN transaction succeed', async () => {
            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            await kycFacet.revokeKyc(signer_B.address)

            const KYCStatusFor_B_After = await kycFacet.getKycStatusFor(
                signer_B.address
            )
            const KYC_Count_After = await kycFacet.getKycAccountsCount(1)
            const [kycAccounts, kycAccountsData] =
                await kycFacet.getKycAccountsData(1, 0, 100)

            expect(KYCStatusFor_B_After).to.equal(0)
            expect(KYC_Count_After).to.equal(0)
            expect(kycAccounts.length).to.equal(0)
            expect(kycAccountsData.length).to.equal(0)
        })

        it('Check Kyc status after expiration', async () => {
            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KYCStatusFor_B_After_Grant = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            await timeTravelFacet.changeSystemTimestamp(_VALID_TO + 1)

            const KYCStatusFor_B_After_Expiration =
                await kycFacet.getKycStatusFor(signer_B.address)

            expect(KYCStatusFor_B_After_Grant).to.equal(1)
            expect(KYCStatusFor_B_After_Expiration).to.equal(0)
        })

        it('Check Kyc status after issuer removed', async () => {
            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KYCStatusFor_B_After_Grant = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            await ssiManagementFacet.removeIssuer(signer_C.address)

            const KYCStatusFor_B_After_Cancelling_Issuer =
                await kycFacet.getKycStatusFor(signer_B.address)

            expect(KYCStatusFor_B_After_Grant).to.equal(1)
            expect(KYCStatusFor_B_After_Cancelling_Issuer).to.equal(0)
        })

        it('Check Kyc status after issuer revokes VC', async () => {
            await kycFacet.grantKyc(
                signer_B.address,
                _VC_ID,
                _VALID_FROM,
                _VALID_TO,
                signer_C.address
            )

            const KYCStatusFor_B_After_Grant = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            await revocationList.connect(signer_C).revoke(_VC_ID)

            const KYCFor_B_After_Revoking_VC = await kycFacet.getKycStatusFor(
                signer_B.address
            )

            expect(KYCStatusFor_B_After_Grant).to.equal(1)
            expect(KYCFor_B_After_Revoking_VC).to.equal(0)
        })

        it('GIVEN kyc WHEN deactivateInternalKyc is called THEN it returns deactivate the internal kyc', async () => {
            await expect(kycFacet.deactivateInternalKyc())
                .to.emit(kycFacet, 'InternalKycStatusUpdated')
                .withArgs(signer_A.address, false)
            expect(await kycFacet.isInternalKycActivated()).to.be.false
        })

        it('GIVEN kyc WHEN activateInternalKyc is called THEN it returns activate the internal kyc', async () => {
            await kycFacet.deactivateInternalKyc()
            expect(await kycFacet.isInternalKycActivated()).to.be.false

            await expect(kycFacet.activateInternalKyc())
                .to.emit(kycFacet, 'InternalKycStatusUpdated')
                .withArgs(signer_A.address, true)
            expect(await kycFacet.isInternalKycActivated()).to.be.true
        })
    })
})
