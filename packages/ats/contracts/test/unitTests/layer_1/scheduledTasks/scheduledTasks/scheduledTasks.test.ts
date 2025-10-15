import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    type ResolverProxy,
    type EquityUSA,
    type Pause,
    type AccessControl,
    TimeTravelFacet,
    ScheduledCrossOrderedTasks,
    type IERC1410,
    Kyc,
    SsiManagement,
} from '@typechain'
import {
    ZERO,
    EMPTY_STRING,
    dateToUnixTimestamp,
    ATS_ROLES,
    ATS_TASK,
} from '@scripts'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployEquityTokenFixture, MAX_UINT256 } from '@test/fixtures'
import { executeRbac } from '@test/fixtures/tokens/common.fixture'

const _PARTITION_ID_1 =
    '0x0000000000000000000000000000000000000000000000000000000000000001'
const INITIAL_AMOUNT = 1000
const DECIMALS_INIT = 6

describe('Scheduled Tasks Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let equityFacet: EquityUSA
    let scheduledTasksFacet: ScheduledCrossOrderedTasks
    let accessControlFacet: AccessControl
    let pauseFacet: Pause
    let erc1410Facet: IERC1410
    let timeTravelFacet: TimeTravelFacet
    let kycFacet: Kyc
    let ssiManagementFacet: SsiManagement

    async function deploySecurityFixtureSinglePartition() {
        const base = await deployEquityTokenFixture()
        diamond = base.diamond
        signer_A = base.deployer
        signer_B = base.user2
        signer_C = base.user3

        await executeRbac(base.accessControlFacet, [
            {
                role: ATS_ROLES.PAUSER,
                members: [signer_B.address],
            },
            {
                role: ATS_ROLES.ISSUER,
                members: [signer_B.address],
            },
            {
                role: ATS_ROLES.KYC,
                members: [signer_B.address],
            },
            {
                role: ATS_ROLES.SSI_MANAGER,
                members: [signer_A.address],
            },
        ])
        await setFacets(diamond)
    }

    async function setFacets(diamond: ResolverProxy) {
        accessControlFacet = await ethers.getContractAt(
            'AccessControlFacet',
            diamond.address,
            signer_A
        )
        equityFacet = await ethers.getContractAt(
            'EquityUSA',
            diamond.address,
            signer_A
        )
        scheduledTasksFacet = await ethers.getContractAt(
            'ScheduledCrossOrderedTasks',
            diamond.address,
            signer_A
        )

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

        timeTravelFacet = await ethers.getContractAt(
            'TimeTravelFacet',
            diamond.address,
            signer_A
        )
        kycFacet = await ethers.getContractAt('Kyc', diamond.address, signer_B)
        ssiManagementFacet = await ethers.getContractAt(
            'SsiManagement',
            diamond.address,
            signer_A
        )
        await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address)
        await kycFacet.grantKyc(
            signer_A.address,
            EMPTY_STRING,
            ZERO,
            MAX_UINT256,
            signer_A.address
        )
    }

    beforeEach(async () => {
        await loadFixture(deploySecurityFixtureSinglePartition)
    })

    afterEach(async () => {
        await timeTravelFacet.resetSystemTimestamp()
    })

    it('GIVEN a paused Token WHEN triggerTasks THEN transaction fails with TokenIsPaused', async () => {
        // Pausing the token
        await pauseFacet.connect(signer_B).pause()

        // trigger scheduled snapshots
        await expect(
            scheduledTasksFacet
                .connect(signer_C)
                .triggerPendingScheduledCrossOrderedTasks()
        ).to.be.rejectedWith('TokenIsPaused')
        await expect(
            scheduledTasksFacet
                .connect(signer_C)
                .triggerScheduledCrossOrderedTasks(1)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN a token WHEN triggerTasks THEN transaction succeeds', async () => {
        // Granting Role to account C
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES.CORPORATE_ACTION, signer_C.address)

        await erc1410Facet.connect(signer_B).issueByPartition({
            partition: _PARTITION_ID_1,
            tokenHolder: signer_A.address,
            value: INITIAL_AMOUNT,
            data: '0x',
        })

        // set dividend
        const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp(
            '2030-01-01T00:00:15Z'
        )
        const dividendsRecordDateInSeconds_2 = dateToUnixTimestamp(
            '2030-01-01T00:00:30Z'
        )
        const dividendsExecutionDateInSeconds = dateToUnixTimestamp(
            '2030-01-01T00:02:30Z'
        )
        const dividendsAmountPerEquity = 1
        const dividendData_1 = {
            recordDate: dividendsRecordDateInSeconds_1.toString(),
            executionDate: dividendsExecutionDateInSeconds.toString(),
            amount: dividendsAmountPerEquity,
        }
        const dividendData_2 = {
            recordDate: dividendsRecordDateInSeconds_2.toString(),
            executionDate: dividendsExecutionDateInSeconds.toString(),
            amount: dividendsAmountPerEquity,
        }
        await equityFacet.connect(signer_C).setDividends(dividendData_2)
        await equityFacet.connect(signer_C).setDividends(dividendData_1)

        const balanceAdjustmentExecutionDateInSeconds_1 = dateToUnixTimestamp(
            '2030-01-01T00:00:16Z'
        )
        const balanceAdjustmentExecutionDateInSeconds_2 = dateToUnixTimestamp(
            '2030-01-01T00:00:31Z'
        )
        const balanceAdjustmentsFactor_1 = 1
        const balanceAdjustmentsDecimals_1 = 2
        const balanceAdjustmentsFactor_2 = 1
        const balanceAdjustmentsDecimals_2 = 2

        const balanceAdjustmentData_1 = {
            executionDate: balanceAdjustmentExecutionDateInSeconds_1.toString(),
            factor: balanceAdjustmentsFactor_1,
            decimals: balanceAdjustmentsDecimals_1,
        }
        const balanceAdjustmentData_2 = {
            executionDate: balanceAdjustmentExecutionDateInSeconds_2.toString(),
            factor: balanceAdjustmentsFactor_2,
            decimals: balanceAdjustmentsDecimals_2,
        }

        await equityFacet
            .connect(signer_C)
            .setScheduledBalanceAdjustment(balanceAdjustmentData_2)
        await equityFacet
            .connect(signer_C)
            .setScheduledBalanceAdjustment(balanceAdjustmentData_1)

        // check schedled tasks

        let scheduledTasksCount =
            await scheduledTasksFacet.scheduledCrossOrderedTaskCount()
        let scheduledTasks =
            await scheduledTasksFacet.getScheduledCrossOrderedTasks(0, 100)

        expect(scheduledTasksCount).to.equal(4)
        expect(scheduledTasks.length).to.equal(scheduledTasksCount)
        expect(scheduledTasks[0].scheduledTimestamp.toNumber()).to.equal(
            balanceAdjustmentExecutionDateInSeconds_2
        )
        expect(scheduledTasks[1].scheduledTimestamp.toNumber()).to.equal(
            dividendsRecordDateInSeconds_2
        )
        expect(scheduledTasks[2].scheduledTimestamp.toNumber()).to.equal(
            balanceAdjustmentExecutionDateInSeconds_1
        )
        expect(scheduledTasks[3].scheduledTimestamp.toNumber()).to.equal(
            dividendsRecordDateInSeconds_1
        )
        expect(scheduledTasks[0].data).to.equal(ATS_TASK.BALANCE_ADJUSTMENT)
        expect(scheduledTasks[1].data).to.equal(ATS_TASK.SNAPSHOT)
        expect(scheduledTasks[2].data).to.equal(ATS_TASK.BALANCE_ADJUSTMENT)
        expect(scheduledTasks[3].data).to.equal(ATS_TASK.SNAPSHOT)

        // AFTER FIRST SCHEDULED TASKS ------------------------------------------------------------------
        await timeTravelFacet.changeSystemTimestamp(
            balanceAdjustmentExecutionDateInSeconds_1 + 1
        )

        // Checking dividends For before triggering from the queue
        const BalanceOf_A_Dividend_1 = await equityFacet.getDividendsFor(
            2,
            signer_A.address
        )
        let BalanceOf_A_Dividend_2 = await equityFacet.getDividendsFor(
            1,
            signer_A.address
        )

        expect(BalanceOf_A_Dividend_1.tokenBalance).to.equal(INITIAL_AMOUNT)
        expect(BalanceOf_A_Dividend_2.tokenBalance).to.equal(0)
        expect(BalanceOf_A_Dividend_1.decimals).to.equal(DECIMALS_INIT)

        // triggering from the queue
        await scheduledTasksFacet
            .connect(signer_A)
            .triggerPendingScheduledCrossOrderedTasks()

        scheduledTasksCount =
            await scheduledTasksFacet.scheduledCrossOrderedTaskCount()

        scheduledTasks =
            await scheduledTasksFacet.getScheduledCrossOrderedTasks(0, 100)

        expect(scheduledTasksCount).to.equal(2)
        expect(scheduledTasks.length).to.equal(scheduledTasksCount)
        expect(scheduledTasks[0].scheduledTimestamp.toNumber()).to.equal(
            balanceAdjustmentExecutionDateInSeconds_2
        )
        expect(scheduledTasks[1].scheduledTimestamp.toNumber()).to.equal(
            dividendsRecordDateInSeconds_2
        )
        expect(scheduledTasks[0].data).to.equal(ATS_TASK.BALANCE_ADJUSTMENT)
        expect(scheduledTasks[1].data).to.equal(ATS_TASK.SNAPSHOT)

        // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
        await timeTravelFacet.changeSystemTimestamp(
            balanceAdjustmentExecutionDateInSeconds_2 + 1
        )
        // Checking dividends For before triggering from the queue
        BalanceOf_A_Dividend_2 = await equityFacet.getDividendsFor(
            1,
            signer_A.address
        )

        expect(BalanceOf_A_Dividend_2.tokenBalance).to.equal(
            INITIAL_AMOUNT * balanceAdjustmentsFactor_1
        )
        expect(BalanceOf_A_Dividend_2.decimals).to.equal(
            DECIMALS_INIT + balanceAdjustmentsDecimals_1
        )

        // triggering from the queue
        await scheduledTasksFacet
            .connect(signer_A)
            .triggerScheduledCrossOrderedTasks(100)

        scheduledTasksCount =
            await scheduledTasksFacet.scheduledCrossOrderedTaskCount()

        scheduledTasks =
            await scheduledTasksFacet.getScheduledCrossOrderedTasks(0, 100)

        expect(scheduledTasksCount).to.equal(0)
        expect(scheduledTasks.length).to.equal(scheduledTasksCount)
    })
})
