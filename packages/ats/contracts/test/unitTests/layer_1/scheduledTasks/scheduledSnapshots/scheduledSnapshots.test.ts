import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    type ResolverProxy,
    type Equity,
    type ScheduledSnapshots,
    type AccessControl,
    ScheduledCrossOrderedTasks,
    TimeTravelFacet,
} from '@typechain'
import { dateToUnixTimestamp, ATS_ROLES } from '@scripts'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployEquityTokenFixture } from '@test/fixtures'
import { executeRbac } from '@test/fixtures/tokens/common.fixture'

describe('Scheduled Snapshots Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let equityFacet: Equity
    let scheduledSnapshotsFacet: ScheduledSnapshots
    let scheduledTasksFacet: ScheduledCrossOrderedTasks
    let accessControlFacet: AccessControl
    let timeTravelFacet: TimeTravelFacet

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
            'Equity',
            diamond.address,
            signer_A
        )
        scheduledSnapshotsFacet = await ethers.getContractAt(
            'ScheduledSnapshots',
            diamond.address,
            signer_A
        )
        scheduledTasksFacet = await ethers.getContractAt(
            'ScheduledCrossOrderedTasks',
            diamond.address,
            signer_A
        )
        timeTravelFacet = await ethers.getContractAt(
            'TimeTravelFacet',
            diamond.address,
            signer_A
        )
    }

    beforeEach(async () => {
        await loadFixture(deploySecurityFixtureSinglePartition)
    })

    afterEach(async () => {
        timeTravelFacet.resetSystemTimestamp()
    })

    it('GIVEN a token WHEN triggerSnapshots THEN transaction succeeds', async () => {
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES.CORPORATE_ACTION, signer_C.address)

        // set dividend
        const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp(
            '2030-01-01T00:00:06Z'
        )
        const dividendsRecordDateInSeconds_2 = dateToUnixTimestamp(
            '2030-01-01T00:00:12Z'
        )
        const dividendsRecordDateInSeconds_3 = dateToUnixTimestamp(
            '2030-01-01T00:00:18Z'
        )
        const dividendsExecutionDateInSeconds = dateToUnixTimestamp(
            '2030-01-01T00:01:00Z'
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
        const dividendData_3 = {
            recordDate: dividendsRecordDateInSeconds_3.toString(),
            executionDate: dividendsExecutionDateInSeconds.toString(),
            amount: dividendsAmountPerEquity,
        }
        await equityFacet.connect(signer_C).setDividends(dividendData_2)
        await equityFacet.connect(signer_C).setDividends(dividendData_3)
        await equityFacet.connect(signer_C).setDividends(dividendData_1)

        const dividend_2_Id =
            '0x0000000000000000000000000000000000000000000000000000000000000001'
        const dividend_3_Id =
            '0x0000000000000000000000000000000000000000000000000000000000000002'
        const dividend_1_Id =
            '0x0000000000000000000000000000000000000000000000000000000000000003'

        // check schedled snapshots
        let scheduledSnapshotCount =
            await scheduledSnapshotsFacet.scheduledSnapshotCount()
        let scheduledSnapshots =
            await scheduledSnapshotsFacet.getScheduledSnapshots(0, 100)

        expect(scheduledSnapshotCount).to.equal(3)
        expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount)
        expect(scheduledSnapshots[0].scheduledTimestamp.toNumber()).to.equal(
            dividendsRecordDateInSeconds_3
        )
        expect(scheduledSnapshots[0].data).to.equal(dividend_3_Id)
        expect(scheduledSnapshots[1].scheduledTimestamp.toNumber()).to.equal(
            dividendsRecordDateInSeconds_2
        )
        expect(scheduledSnapshots[1].data).to.equal(dividend_2_Id)
        expect(scheduledSnapshots[2].scheduledTimestamp.toNumber()).to.equal(
            dividendsRecordDateInSeconds_1
        )
        expect(scheduledSnapshots[2].data).to.equal(dividend_1_Id)

        // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
        await timeTravelFacet.changeSystemTimestamp(
            dividendsRecordDateInSeconds_1 + 1
        )
        await expect(
            scheduledTasksFacet
                .connect(signer_A)
                .triggerPendingScheduledCrossOrderedTasks()
        )
            .to.emit(scheduledSnapshotsFacet, 'SnapshotTriggered')
            .withArgs(signer_A.address, 1)

        scheduledSnapshotCount =
            await scheduledSnapshotsFacet.scheduledSnapshotCount()
        scheduledSnapshots =
            await scheduledSnapshotsFacet.getScheduledSnapshots(0, 100)

        expect(scheduledSnapshotCount).to.equal(2)
        expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount)
        expect(scheduledSnapshots[0].scheduledTimestamp.toNumber()).to.equal(
            dividendsRecordDateInSeconds_3
        )
        expect(scheduledSnapshots[0].data).to.equal(dividend_3_Id)
        expect(scheduledSnapshots[1].scheduledTimestamp.toNumber()).to.equal(
            dividendsRecordDateInSeconds_2
        )
        expect(scheduledSnapshots[1].data).to.equal(dividend_2_Id)

        // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
        await timeTravelFacet.changeSystemTimestamp(
            dividendsRecordDateInSeconds_2 + 1
        )
        await expect(
            scheduledTasksFacet
                .connect(signer_A)
                .triggerScheduledCrossOrderedTasks(100)
        )
            .to.emit(scheduledSnapshotsFacet, 'SnapshotTriggered')
            .withArgs(signer_A.address, 2)

        scheduledSnapshotCount =
            await scheduledSnapshotsFacet.scheduledSnapshotCount()
        scheduledSnapshots =
            await scheduledSnapshotsFacet.getScheduledSnapshots(0, 100)

        expect(scheduledSnapshotCount).to.equal(1)
        expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount)
        expect(scheduledSnapshots[0].scheduledTimestamp.toNumber()).to.equal(
            dividendsRecordDateInSeconds_3
        )
        expect(scheduledSnapshots[0].data).to.equal(dividend_3_Id)

        // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
        await timeTravelFacet.changeSystemTimestamp(
            dividendsRecordDateInSeconds_3 + 1
        )
        await expect(
            scheduledTasksFacet
                .connect(signer_A)
                .triggerScheduledCrossOrderedTasks(0)
        )
            .to.emit(scheduledSnapshotsFacet, 'SnapshotTriggered')
            .withArgs(signer_A.address, 3)

        scheduledSnapshotCount =
            await scheduledSnapshotsFacet.scheduledSnapshotCount()
        scheduledSnapshots =
            await scheduledSnapshotsFacet.getScheduledSnapshots(0, 100)

        expect(scheduledSnapshotCount).to.equal(0)
        expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount)
    })
})
