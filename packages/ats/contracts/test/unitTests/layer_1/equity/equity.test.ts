import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    type ResolverProxy,
    type EquityUSA,
    type Pause,
    type AccessControl,
    Lock,
    IHold,
    type IERC1410,
    Kyc,
    SsiManagement,
    ClearingActionsFacet,
    ClearingTransferFacet,
    FreezeFacet,
    TimeTravelFacet,
} from '@contract-types'
import {
    DEFAULT_PARTITION,
    ADDRESS_ZERO,
    dateToUnixTimestamp,
    EMPTY_STRING,
    ZERO,
    EMPTY_HEX_BYTES,
    ATS_ROLES,
} from '@scripts'
import { grantRoleAndPauseToken } from '@test'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployEquityTokenFixture, MAX_UINT256 } from '@test'
import { executeRbac } from '@test'

let dividendsRecordDateInSeconds = 0
let dividendsExecutionDateInSeconds = 0
const dividendsAmountPerEquity = 1

let votingRecordDateInSeconds = 0

let balanceAdjustmentExecutionDateInSeconds = 0
const balanceAdjustmentFactor = 356
const balanceAdjustmentDecimals = 2

const voteData = '0x'
let votingData = {
    recordDate: votingRecordDateInSeconds.toString(),
    data: voteData,
}
let dividendData = {
    recordDate: dividendsRecordDateInSeconds.toString(),
    executionDate: dividendsExecutionDateInSeconds.toString(),
    amount: dividendsAmountPerEquity,
}
let balanceAdjustmentData = {
    executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
    factor: balanceAdjustmentFactor,
    decimals: balanceAdjustmentDecimals,
}
const number_Of_Shares = 100000n
const EMPTY_VC_ID = EMPTY_STRING

describe('Equity Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let equityFacet: EquityUSA
    let accessControlFacet: AccessControl
    let pauseFacet: Pause
    let lockFacet: Lock
    let holdFacet: IHold
    let erc1410Facet: IERC1410
    let timeTravelFacet: TimeTravelFacet
    let kycFacet: Kyc
    let ssiManagementFacet: SsiManagement
    let clearingActionsFacet: ClearingActionsFacet
    let clearingTransferFacet: ClearingTransferFacet
    let freezeFacet: FreezeFacet

    async function deploySecurityFixtureSinglePartition() {
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
            {
                role: ATS_ROLES._KYC_ROLE,
                members: [signer_B.address],
            },
            {
                role: ATS_ROLES._SSI_MANAGER_ROLE,
                members: [signer_A.address],
            },
        ])

        pauseFacet = await ethers.getContractAt(
            'Pause',
            diamond.address,
            signer_A
        )
        lockFacet = await ethers.getContractAt(
            'Lock',
            diamond.address,
            signer_A
        )
        holdFacet = await ethers.getContractAt(
            'IHold',
            diamond.address,
            signer_A
        )
        erc1410Facet = await ethers.getContractAt(
            'IERC1410',
            diamond.address,
            signer_A
        )
        timeTravelFacet = await ethers.getContractAt(
            'TimeTravelFacet',
            diamond.address,
            signer_A
        )
        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address,
            signer_A
        )
        equityFacet = await ethers.getContractAt(
            'EquityUSAFacetTimeTravel',
            diamond.address,
            signer_A
        )
        kycFacet = await ethers.getContractAt('Kyc', diamond.address, signer_B)
        ssiManagementFacet = await ethers.getContractAt(
            'SsiManagement',
            diamond.address,
            signer_A
        )
        clearingTransferFacet = await ethers.getContractAt(
            'ClearingTransferFacet',
            diamond.address,
            signer_A
        )
        clearingActionsFacet = await ethers.getContractAt(
            'ClearingActionsFacet',
            diamond.address,
            signer_A
        )
        freezeFacet = await ethers.getContractAt(
            'FreezeFacet',
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
        dividendsRecordDateInSeconds = dateToUnixTimestamp(
            '2030-01-01T00:00:10Z'
        )
        dividendsExecutionDateInSeconds = dateToUnixTimestamp(
            '2030-01-01T00:16:40Z'
        )
        votingRecordDateInSeconds = dateToUnixTimestamp('2030-01-01T00:00:10Z')
        balanceAdjustmentExecutionDateInSeconds = dateToUnixTimestamp(
            '2030-01-01T00:00:10Z'
        )

        votingData = {
            recordDate: votingRecordDateInSeconds.toString(),
            data: voteData,
        }
        dividendData = {
            recordDate: dividendsRecordDateInSeconds.toString(),
            executionDate: dividendsExecutionDateInSeconds.toString(),
            amount: dividendsAmountPerEquity,
        }
        balanceAdjustmentData = {
            executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
            factor: balanceAdjustmentFactor,
            decimals: balanceAdjustmentDecimals,
        }

        await loadFixture(deploySecurityFixtureSinglePartition)
    })

    describe('Dividends', () => {
        it('GIVEN an account without corporateActions role WHEN setDividends THEN transaction fails with AccountHasNoRole', async () => {
            // set dividend fails
            await expect(
                equityFacet.connect(signer_C).setDividends(dividendData)
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN a paused Token WHEN setDividends THEN transaction fails with TokenIsPaused', async () => {
            // Granting Role to account C and Pause
            await grantRoleAndPauseToken(
                accessControlFacet,
                pauseFacet,
                ATS_ROLES._CORPORATE_ACTION_ROLE,
                signer_A,
                signer_B,
                signer_C.address
            )

            // set dividend fails
            await expect(
                equityFacet.connect(signer_C).setDividends(dividendData)
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN an account with corporateActions role WHEN setDividends with wrong dates THEN transaction fails', async () => {
            await timeTravelFacet.changeSystemTimestamp(
                dateToUnixTimestamp('2030-01-01T00:00:00Z')
            )
            // Granting Role to account C
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address)

            // set dividend
            const wrongDividendData_1 = {
                recordDate: dividendsExecutionDateInSeconds.toString(),
                executionDate: dividendsRecordDateInSeconds.toString(),
                amount: dividendsAmountPerEquity,
            }

            await expect(
                equityFacet.connect(signer_C).setDividends(wrongDividendData_1)
            ).to.be.revertedWithCustomError(equityFacet, 'WrongDates')

            const wrongDividendData_2 = {
                recordDate: dateToUnixTimestamp(
                    '2029-12-31T23:59:59Z'
                ).toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: dividendsAmountPerEquity,
            }

            await expect(
                equityFacet.connect(signer_C).setDividends(wrongDividendData_2)
            ).to.be.revertedWithCustomError(equityFacet, 'WrongTimestamp')
        })

        it('GIVEN an account with corporateActions role WHEN setDividends THEN transaction succeeds', async () => {
            // Granting Role to account C
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address)

            // set dividend
            await expect(
                equityFacet.connect(signer_C).setDividends(dividendData)
            )
                .to.emit(equityFacet, 'DividendSet')
                .withArgs(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                    1,
                    signer_C.address,
                    dividendsRecordDateInSeconds,
                    dividendsExecutionDateInSeconds,
                    dividendsAmountPerEquity
                )

            // check list members
            await expect(equityFacet.getDividends(1000)).to.be.rejectedWith(
                'WrongIndexForAction'
            )

            const listCount = await equityFacet.getDividendsCount()
            const dividend = await equityFacet.getDividends(1)
            const dividendFor = await equityFacet.getDividendsFor(
                1,
                signer_A.address
            )
            const dividendTotalHolder =
                await equityFacet.getTotalDividendHolders(1)
            const dividendHolders = await equityFacet.getDividendHolders(
                1,
                0,
                dividendTotalHolder
            )

            expect(listCount).to.equal(1)
            expect(dividend.snapshotId).to.equal(0)
            expect(dividend.dividend.recordDate).to.equal(
                dividendsRecordDateInSeconds
            )
            expect(dividend.dividend.executionDate).to.equal(
                dividendsExecutionDateInSeconds
            )
            expect(dividend.dividend.amount).to.equal(dividendsAmountPerEquity)
            expect(dividendFor.recordDate).to.equal(
                dividendsRecordDateInSeconds
            )
            expect(dividendFor.executionDate).to.equal(
                dividendsExecutionDateInSeconds
            )
            expect(dividendFor.amount).to.equal(dividendsAmountPerEquity)
            expect(dividendFor.tokenBalance).to.equal(0)
            expect(dividendFor.recordDateReached).to.equal(false)
            expect(dividendFor.decimals).to.equal(0)
            expect(dividendTotalHolder).to.equal(0)
            expect(dividendHolders.length).to.equal(dividendTotalHolder)
        })

        it('GIVEN an account with corporateActions role WHEN setDividends and lock THEN transaction succeeds', async () => {
            // Granting Role to account C
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address)

            // issue and lock
            const TotalAmount = number_Of_Shares
            const LockedAmount = TotalAmount - 5n

            await erc1410Facet.connect(signer_C).issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: TotalAmount,
                data: '0x',
            })

            await lockFacet
                .connect(signer_C)
                .lock(LockedAmount, signer_A.address, 99999999999)

            // set dividend
            await expect(
                equityFacet.connect(signer_C).setDividends(dividendData)
            )
                .to.emit(equityFacet, 'DividendSet')
                .withArgs(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                    1,
                    signer_C.address,
                    dividendsRecordDateInSeconds,
                    dividendsExecutionDateInSeconds,
                    dividendsAmountPerEquity
                )

            // check list members
            await timeTravelFacet.changeSystemTimestamp(
                dividendsRecordDateInSeconds + 1
            )
            const dividendFor = await equityFacet.getDividendsFor(
                1,
                signer_A.address
            )
            const dividendTotalHolder =
                await equityFacet.getTotalDividendHolders(1)
            const dividendHolders = await equityFacet.getDividendHolders(
                1,
                0,
                dividendTotalHolder
            )

            expect(dividendFor.tokenBalance).to.equal(TotalAmount)
            expect(dividendFor.recordDateReached).to.equal(true)
            expect(dividendTotalHolder).to.equal(1)
            expect(dividendHolders.length).to.equal(dividendTotalHolder)
            expect(dividendHolders).to.have.members([signer_A.address])
        })

        it('GIVEN an account with corporateActions role WHEN setDividends and hold THEN transaction succeeds', async () => {
            // Granting Role to account C
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address)

            // issue and hold
            const TotalAmount = number_Of_Shares
            const HeldAmount = TotalAmount - 5n

            await erc1410Facet.connect(signer_C).issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: TotalAmount,
                data: '0x',
            })

            const hold = {
                amount: HeldAmount,
                expirationTimestamp: 999999999999999,
                escrow: signer_B.address,
                to: ADDRESS_ZERO,
                data: '0x',
            }

            await holdFacet.createHoldByPartition(DEFAULT_PARTITION, hold)

            // set dividend
            await expect(
                equityFacet.connect(signer_C).setDividends(dividendData)
            )
                .to.emit(equityFacet, 'DividendSet')
                .withArgs(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                    1,
                    signer_C.address,
                    dividendsRecordDateInSeconds,
                    dividendsExecutionDateInSeconds,
                    dividendsAmountPerEquity
                )

            // check list members
            await timeTravelFacet.changeSystemTimestamp(
                dividendsRecordDateInSeconds + 1
            )
            const dividendFor = await equityFacet.getDividendsFor(
                1,
                signer_A.address
            )
            const dividendTotalHolder =
                await equityFacet.getTotalDividendHolders(1)
            const dividendHolders = await equityFacet.getDividendHolders(
                1,
                0,
                dividendTotalHolder
            )

            expect(dividendFor.tokenBalance).to.equal(TotalAmount)
            expect(dividendFor.recordDateReached).to.equal(true)
            expect(dividendTotalHolder).to.equal(1)
            expect(dividendHolders.length).to.equal(dividendTotalHolder)
            expect(dividendHolders).to.have.members([signer_A.address])
        })

        it('GIVEN scheduled dividends WHEN record date is reached AND scheduled balance adjustments is set after record date THEN dividends are paid without adjusted balance', async () => {
            await accessControlFacet.grantRole(
                ATS_ROLES._CORPORATE_ACTION_ROLE,
                signer_C.address
            )
            await accessControlFacet.grantRole(
                ATS_ROLES._ISSUER_ROLE,
                signer_C.address
            )
            await accessControlFacet.grantRole(
                ATS_ROLES._LOCKER_ROLE,
                signer_C.address
            )
            await accessControlFacet.grantRole(
                ATS_ROLES._CLEARING_ROLE,
                signer_C.address
            )
            await accessControlFacet.grantRole(
                ATS_ROLES._FREEZE_MANAGER_ROLE,
                signer_C.address
            )

            const TotalAmount = number_Of_Shares
            const amounts = TotalAmount / 5n

            await erc1410Facet.connect(signer_C).issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: TotalAmount,
                data: '0x',
            })

            const hold = {
                amount: amounts,
                expirationTimestamp: 999999999999999,
                escrow: signer_B.address,
                to: ADDRESS_ZERO,
                data: '0x',
            }

            await lockFacet
                .connect(signer_C)
                .lock(amounts, signer_A.address, 99999999999)

            await holdFacet.createHoldByPartition(DEFAULT_PARTITION, hold)

            await freezeFacet
                .connect(signer_C)
                .freezePartialTokens(signer_A.address, amounts)

            await clearingActionsFacet.connect(signer_C).activateClearing()

            const clearingOperation = {
                partition: DEFAULT_PARTITION,
                expirationTimestamp: 99999999999,
                data: EMPTY_HEX_BYTES,
            }

            await clearingTransferFacet.clearingTransferByPartition(
                clearingOperation,
                amounts,
                signer_B.address
            )

            balanceAdjustmentData.executionDate = dateToUnixTimestamp(
                '2030-01-01T00:00:15Z'
            ).toString() // 5 seconds after dividend record date

            await equityFacet.connect(signer_C).setDividends(dividendData)
            await equityFacet
                .connect(signer_C)
                .setScheduledBalanceAdjustment(balanceAdjustmentData)

            // Travel to 5 seconds after balance adjustment execution date
            await timeTravelFacet.changeSystemTimestamp(
                dateToUnixTimestamp('2030-01-01T00:20Z').toString()
            )

            // Check user dividend balance does not include balance adjustment
            const dividendFor = await equityFacet.getDividendsFor(
                1,
                signer_A.address
            )
            expect(dividendFor.tokenBalance).to.equal(TotalAmount)
            expect(dividendFor.recordDateReached).to.equal(true)
            expect(dividendFor.amount).to.equal(dividendsAmountPerEquity)
        })
    })

    describe('Voting rights', () => {
        it('GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole', async () => {
            // set dividend fails
            await expect(
                equityFacet.connect(signer_C).setVoting(votingData)
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN a paused Token WHEN setVoting THEN transaction fails with TokenIsPaused', async () => {
            // Granting Role to account C and Pause
            await grantRoleAndPauseToken(
                accessControlFacet,
                pauseFacet,
                ATS_ROLES._CORPORATE_ACTION_ROLE,
                signer_A,
                signer_B,
                signer_C.address
            )

            // set dividend fails
            await expect(
                equityFacet.connect(signer_C).setVoting(votingData)
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN an account with corporateActions role WHEN setVoting THEN transaction succeeds', async () => {
            // Granting Role to account C
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address)

            // set dividend
            await expect(equityFacet.connect(signer_C).setVoting(votingData))
                .to.emit(equityFacet, 'VotingSet')
                .withArgs(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                    1,
                    signer_C.address,
                    votingRecordDateInSeconds,
                    voteData
                )

            // check list members
            // await expect(equityFacet.getVoting(1000)).to.be.rejectedWith(
            //     'WrongIndexForAction'
            // )

            const listCount = await equityFacet.getVotingCount()
            const voting = await equityFacet.getVoting(1)
            const votingFor = await equityFacet.getVotingFor(
                1,
                signer_A.address
            )
            const votingTotalHolder = await equityFacet.getTotalVotingHolders(1)
            const votingHolders = await equityFacet.getVotingHolders(
                1,
                0,
                votingTotalHolder
            )

            expect(listCount).to.equal(1)
            expect(voting.snapshotId).to.equal(0)
            expect(voting.voting.recordDate).to.equal(votingRecordDateInSeconds)
            expect(voting.voting.data).to.equal(voteData)
            expect(votingFor.recordDate).to.equal(dividendsRecordDateInSeconds)
            expect(votingFor.data).to.equal(voteData)
            expect(votingFor.tokenBalance).to.equal(0)
            expect(votingFor.recordDateReached).to.equal(false)
            expect(votingTotalHolder).to.equal(0)
            expect(votingHolders.length).to.equal(votingTotalHolder)
        })

        it('GIVEN an account with corporateActions role WHEN setVoting and lock THEN transaction succeeds', async () => {
            // Granting Role to account C
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address)
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address)

            // issue and lock
            const TotalAmount = number_Of_Shares
            const LockedAmount = TotalAmount - 5n

            await erc1410Facet.connect(signer_C).issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: TotalAmount,
                data: '0x',
            })
            await lockFacet
                .connect(signer_C)
                .lock(LockedAmount, signer_A.address, 99999999999)

            // set dividend
            await expect(equityFacet.connect(signer_C).setVoting(votingData))
                .to.emit(equityFacet, 'VotingSet')
                .withArgs(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                    1,
                    signer_C.address,
                    votingRecordDateInSeconds,
                    voteData
                )

            await timeTravelFacet.changeSystemTimestamp(
                votingRecordDateInSeconds + 1
            )
            const votingFor = await equityFacet.getVotingFor(
                1,
                signer_A.address
            )
            const votingTotalHolder = await equityFacet.getTotalVotingHolders(1)
            const votingHolders = await equityFacet.getVotingHolders(
                1,
                0,
                votingTotalHolder
            )

            expect(votingFor.tokenBalance).to.equal(TotalAmount)
            expect(votingFor.recordDateReached).to.equal(true)
            expect(votingTotalHolder).to.equal(1)
            expect(votingHolders.length).to.equal(votingTotalHolder)
            expect(votingHolders).to.have.members([signer_A.address])
        })
    })

    describe('Balance adjustments', () => {
        it('GIVEN an account without corporateActions role WHEN setBalanceAdjustment THEN transaction fails with AccountHasNoRole', async () => {
            // set dividend fails
            await expect(
                equityFacet
                    .connect(signer_C)
                    .setScheduledBalanceAdjustment(balanceAdjustmentData)
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN a paused Token WHEN setBalanceAdjustment THEN transaction fails with TokenIsPaused', async () => {
            // Granting Role to account C and Pause
            await grantRoleAndPauseToken(
                accessControlFacet,
                pauseFacet,
                ATS_ROLES._CORPORATE_ACTION_ROLE,
                signer_A,
                signer_B,
                signer_C.address
            )

            // set dividend fails
            await expect(
                equityFacet
                    .connect(signer_C)
                    .setScheduledBalanceAdjustment(balanceAdjustmentData)
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN an account with corporateActions role WHEN setBalanceAdjustment THEN transaction succeeds', async () => {
            // Granting Role to account C
            await accessControlFacet
                .connect(signer_A)
                .grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address)

            // set dividend
            await expect(
                equityFacet
                    .connect(signer_C)
                    .setScheduledBalanceAdjustment(balanceAdjustmentData)
            )
                .to.emit(equityFacet, 'ScheduledBalanceAdjustmentSet')
                .withArgs(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                    1,
                    signer_C.address,
                    balanceAdjustmentExecutionDateInSeconds,
                    balanceAdjustmentFactor,
                    balanceAdjustmentDecimals
                )

            const listCount =
                await equityFacet.getScheduledBalanceAdjustmentCount()
            const balanceAdjustment =
                await equityFacet.getScheduledBalanceAdjustment(1)

            expect(listCount).to.equal(1)
            expect(balanceAdjustment.executionDate).to.equal(
                balanceAdjustmentExecutionDateInSeconds
            )
            expect(balanceAdjustment.factor).to.equal(balanceAdjustmentFactor)
            expect(balanceAdjustment.decimals).to.equal(
                balanceAdjustmentDecimals
            )
        })
    })
})
