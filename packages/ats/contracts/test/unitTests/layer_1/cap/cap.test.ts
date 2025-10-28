import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    type ResolverProxy,
    type Cap,
    type IERC1410,
    AccessControl,
    Pause,
    Kyc,
    SsiManagement,
    Equity,
    Snapshots,
    TimeTravelFacet,
} from '@contract-types'
import { ZERO, EMPTY_STRING, dateToUnixTimestamp, ATS_ROLES } from '@scripts'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployEquityTokenFixture, MAX_UINT256 } from '@test'
import { executeRbac } from '@test'

const _PARTITION_ID_1 =
    '0x0000000000000000000000000000000000000000000000000000000000000001'
const maxSupply = 3
const maxSupplyByPartition = 2
const issueAmount = 2
const _PARTITION_ID_2 =
    '0x0000000000000000000000000000000000000000000000000000000000000002'
const TIME = 6000
const EMPTY_VC_ID = EMPTY_STRING

interface Adjustment {
    executionDate: string
    factor: number
    decimals: number
}

describe('Cap Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let capFacet: Cap
    let accessControlFacet: AccessControl
    let pauseFacet: Pause
    let erc1410Facet: IERC1410
    let kycFacet: Kyc
    let ssiManagementFacet: SsiManagement
    let equityFacet: Equity
    let snapshotFacet: Snapshots
    let timeTravelFacet: TimeTravelFacet

    async function deploySecurityFixtureMultiPartition() {
        const base = await deployEquityTokenFixture({
            equityDataParams: {
                securityData: {
                    isMultiPartition: true,
                    maxSupply: maxSupply * 2,
                },
            },
        })
        diamond = base.diamond
        signer_A = base.deployer
        signer_B = base.user2
        signer_C = base.user3

        await executeRbac(base.accessControlFacet, [
            {
                role: ATS_ROLES._PAUSER_ROLE,
                members: [signer_B.address],
            },
            {
                role: ATS_ROLES._KYC_ROLE,
                members: [signer_B.address],
            },
            {
                role: ATS_ROLES._SSI_MANAGER_ROLE,
                members: [signer_A.address],
            },
            {
                role: ATS_ROLES._CAP_ROLE,
                members: [signer_A.address],
            },
        ])

        capFacet = await ethers.getContractAt('Cap', diamond.address, signer_A)
        pauseFacet = await ethers.getContractAt(
            'Pause',
            diamond.address,
            signer_A
        )
        erc1410Facet = await ethers.getContractAt(
            'IERC1410',
            diamond.address,
            signer_A
        )
        kycFacet = await ethers.getContractAt('Kyc', diamond.address, signer_B)
        ssiManagementFacet = await ethers.getContractAt(
            'SsiManagement',
            diamond.address,
            signer_A
        )
        equityFacet = await ethers.getContractAt(
            'Equity',
            diamond.address,
            signer_A
        )
        snapshotFacet = await ethers.getContractAt(
            'Snapshots',
            diamond.address,
            signer_A
        )
        accessControlFacet = await ethers.getContractAt(
            'AccessControlFacet',
            diamond.address,
            signer_A
        )
        timeTravelFacet = await ethers.getContractAt(
            'TimeTravelFacet',
            diamond.address,
            signer_A
        )
        await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address)
        await kycFacet.grantKyc(
            signer_A.address,
            EMPTY_VC_ID,
            ZERO,
            MAX_UINT256,
            signer_A.address
        )
    }

    beforeEach(async () => {
        await loadFixture(deploySecurityFixtureMultiPartition)
    })

    it('GIVEN setting 0 to max supply WHEN trying to initialize THEN transaction fails', async () => {
        await expect(
            deployEquityTokenFixture({
                equityDataParams: {
                    securityData: {
                        isMultiPartition: true,
                        maxSupply: 0,
                    },
                },
            })
        ).to.be.rejectedWith('NewMaxSupplyCannotBeZero')
    })

    it('GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized', async () => {
        await expect(capFacet.initialize_Cap(5, [])).to.be.rejectedWith(
            'AlreadyInitialized'
        )
    })

    describe('Paused', () => {
        beforeEach(async () => {
            // Pausing the token
            await pauseFacet.connect(signer_B).pause()
        })

        it('GIVEN a paused Token WHEN setMaxSupply THEN transaction fails with TokenIsPaused', async () => {
            // transfer with data fails
            await expect(
                capFacet.connect(signer_C).setMaxSupply(maxSupply)
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN a paused Token WHEN setMaxSupplyByPartition THEN transaction fails with TokenIsPaused', async () => {
            // transfer from with data fails
            await expect(
                capFacet
                    .connect(signer_C)
                    .setMaxSupplyByPartition(
                        _PARTITION_ID_1,
                        maxSupplyByPartition
                    )
            ).to.be.rejectedWith('TokenIsPaused')
        })
    })

    describe('AccessControl', () => {
        it('GIVEN an account without cap role WHEN setMaxSupply THEN transaction fails with AccountHasNoRole', async () => {
            // add to list fails
            await expect(
                capFacet.connect(signer_C).setMaxSupply(maxSupply)
            ).to.be.rejectedWith(Error)
        })

        it('GIVEN an account without cap role WHEN setMaxSupplyByPartition THEN transaction fails with AccountHasNoRole', async () => {
            // add to list fails
            await expect(
                capFacet
                    .connect(signer_C)
                    .setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply)
            ).to.be.revertedWithCustomError(capFacet, 'AccountHasNoRole')
        })
    })

    describe('New Max Supply Too low or 0', () => {
        it('GIVEN a token WHEN setMaxSupply to 0 THEN transaction fails with NewMaxSupplyCannotBeZero', async () => {
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CAP_ROLE, signer_C.address)

            // add to list fails
            await expect(
                capFacet.connect(signer_C).setMaxSupply(0)
            ).to.be.revertedWithCustomError(
                capFacet,
                'NewMaxSupplyCannotBeZero'
            )
        })
        it('GIVEN a token WHEN setMaxSupply a value that is less than the current total supply THEN transaction fails with NewMaxSupplyTooLow', async () => {
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CAP_ROLE, signer_C.address)

            await erc1410Facet.connect(signer_C).issueByPartition({
                partition: _PARTITION_ID_1,
                tokenHolder: signer_A.address,
                value: maxSupply * 2,
                data: '0x',
            })

            // add to list fails
            await expect(
                capFacet.connect(signer_C).setMaxSupply(maxSupply)
            ).to.be.revertedWithCustomError(capFacet, 'NewMaxSupplyTooLow')
        })

        it('GIVEN a token WHEN setMaxSupplyByPartition a value that is less than the current total supply THEN transaction fails with NewMaxSupplyForPartitionTooLow', async () => {
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CAP_ROLE, signer_C.address)

            await erc1410Facet.connect(signer_C).issueByPartition({
                partition: _PARTITION_ID_1,
                tokenHolder: signer_A.address,
                value: maxSupply * 2,
                data: '0x',
            })

            // add to list fails
            await expect(
                capFacet
                    .connect(signer_C)
                    .setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply)
            ).to.be.revertedWithCustomError(
                capFacet,
                'NewMaxSupplyForPartitionTooLow'
            )
        })
    })

    describe('New Max Supply By Partition Too High', () => {
        it('GIVEN a token WHEN setMaxSupplyByPartition a value that is less than the current total supply THEN transaction fails with NewMaxSupplyByPartitionTooHigh', async () => {
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CAP_ROLE, signer_C.address)

            // add to list fails
            await expect(
                capFacet
                    .connect(signer_C)
                    .setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply * 100)
            ).to.eventually.be.rejectedWith('NewMaxSupplyByPartitionTooHigh')
        })
    })

    describe('New Max Supply OK', () => {
        it('GIVEN a token WHEN setMaxSupply THEN transaction succeeds', async () => {
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CAP_ROLE, signer_C.address)

            await expect(capFacet.connect(signer_C).setMaxSupply(maxSupply * 4))
                .to.emit(capFacet, 'MaxSupplySet')
                .withArgs(signer_C.address, maxSupply * 4, maxSupply * 2)

            const currentMaxSupply = await capFacet.getMaxSupply()

            expect(currentMaxSupply).to.equal(maxSupply * 4)
        })

        it('GIVEN a token WHEN setMaxSupplyByPartition THEN transaction succeeds', async () => {
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CAP_ROLE, signer_C.address)

            await expect(
                capFacet
                    .connect(signer_C)
                    .setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply * 2)
            )
                .to.emit(capFacet, 'MaxSupplyByPartitionSet')
                .withArgs(signer_C.address, _PARTITION_ID_1, maxSupply * 2, 0)

            const currentMaxSupply =
                await capFacet.getMaxSupplyByPartition(_PARTITION_ID_1)

            expect(currentMaxSupply).to.equal(maxSupply * 2)
        })
    })

    describe('Adjust balances', () => {
        beforeEach(async () => {
            await setPreBalanceAdjustment()
        })

        const setupScheduledBalanceAdjustments = async (
            adjustments: Adjustment[]
        ) => {
            for (const adjustment of adjustments) {
                await equityFacet
                    .connect(signer_C)
                    .setScheduledBalanceAdjustment(adjustment)
            }
        }

        const createAdjustmentData = (
            currentTime: number,
            intervals: number[],
            factors: number[],
            decimals: number[]
        ): Adjustment[] => {
            return intervals.map((interval, index) => ({
                executionDate: (currentTime + interval).toString(),
                factor: factors[index],
                decimals: decimals[index],
            }))
        }

        const testBalanceAdjustments = async (
            adjustments: Adjustment[],
            expectedFactors: number[]
        ) => {
            await setupScheduledBalanceAdjustments(adjustments)

            // Execute adjustments and verify
            for (let i = 0; i < adjustments.length; i++) {
                await timeTravelFacet.changeSystemTimestamp(
                    dateToUnixTimestamp(`2030-01-01T00:00:00Z`) +
                        ((i + 1) * TIME) / 1000 +
                        1
                )
                await snapshotFacet.connect(signer_A).takeSnapshot()
            }

            const currentMaxSupply = await capFacet.getMaxSupply()
            const currentMaxSupplyByPartition_1 =
                await capFacet.getMaxSupplyByPartition(_PARTITION_ID_1)

            const adjustmentFactor = expectedFactors.reduce(
                (acc, val) => acc * val,
                1
            )
            expect(currentMaxSupply).to.equal(maxSupply * adjustmentFactor)
            expect(currentMaxSupplyByPartition_1).to.equal(
                maxSupplyByPartition * adjustmentFactor
            )
        }

        async function setPreBalanceAdjustment() {
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CAP_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address)

            await capFacet.connect(signer_C).setMaxSupply(maxSupply)
            await capFacet
                .connect(signer_C)
                .setMaxSupplyByPartition(_PARTITION_ID_1, maxSupplyByPartition)

            await kycFacet.grantKyc(
                signer_C.address,
                EMPTY_VC_ID,
                ZERO,
                MAX_UINT256,
                signer_A.address
            )
            await erc1410Facet.connect(signer_C).issueByPartition({
                partition: _PARTITION_ID_1,
                tokenHolder: signer_C.address,
                value: issueAmount,
                data: '0x',
            })
        }

        it('GIVEN a token WHEN getMaxSupply or getMaxSupplyByPartition THEN balance adjustments are included', async () => {
            const adjustments = createAdjustmentData(
                dateToUnixTimestamp('2030-01-01T00:00:00Z'),
                [TIME / 1000, (2 * TIME) / 1000, (3 * TIME) / 1000],
                [5, 6, 7],
                [2, 0, 1]
            )
            const currentMaxSupplyByPartition_2 =
                await capFacet.getMaxSupplyByPartition(_PARTITION_ID_2)
            expect(currentMaxSupplyByPartition_2).to.equal(0)
            await testBalanceAdjustments(adjustments, [5, 6, 7])
        })

        it('GIVEN a token WHEN setMaxSupply THEN balance adjustments are included', async () => {
            const currentTime = dateToUnixTimestamp(`2030-01-01T00:00:00Z`)
            const adjustments = createAdjustmentData(
                currentTime,
                [TIME / 1000],
                [5],
                [0]
            )

            await setupScheduledBalanceAdjustments(adjustments)

            // Execute adjustments and verify reversion case
            await timeTravelFacet.changeSystemTimestamp(
                adjustments[0].executionDate + 1
            )

            await expect(
                capFacet.setMaxSupply(maxSupplyByPartition)
            ).to.eventually.be.rejectedWith('NewMaxSupplyTooLow')
        })

        it('GIVEN a token WHEN max supply and partition max supply are set THEN balance adjustments occur and resetting partition max supply fails with NewMaxSupplyForPartitionTooLow', async () => {
            // scheduled balance adjustments
            const currentTime = dateToUnixTimestamp(`2030-01-01T00:00:00Z`)
            const adjustments = createAdjustmentData(
                currentTime,
                [TIME / 1000],
                [5],
                [0]
            )

            await setupScheduledBalanceAdjustments(adjustments)
            //-------------------------
            // wait for first balance adjustment
            await timeTravelFacet.changeSystemTimestamp(
                adjustments[0].executionDate + 1
            )

            // Attempt to change the max supply by partition with the same value as before
            await expect(
                capFacet.setMaxSupplyByPartition(
                    _PARTITION_ID_1,
                    maxSupplyByPartition
                )
            ).to.eventually.be.rejectedWith('NewMaxSupplyForPartitionTooLow')
        })
    })
})
