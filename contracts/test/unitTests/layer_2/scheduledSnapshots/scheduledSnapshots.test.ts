import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Equity,
    type Pause,
    type ScheduledSnapshots,
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

const TIME = 6000

describe('Scheduled Snapshots Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string

    let equityFacet: Equity
    let scheduledSnapshotsFacet: ScheduledSnapshots
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
            RegulationType.REG_D,
            RegulationSubType.REG_D_506_B,
            true,
            'ES,FR,CH',
            'nothing',
            init_rbacs
        )

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        equityFacet = await ethers.getContractAt('Equity', diamond.address)

        scheduledSnapshotsFacet = await ethers.getContractAt(
            'ScheduledSnapshots',
            diamond.address
        )

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    })

    it('GIVEN a paused Token WHEN triggerSnapshots THEN transaction fails with TokenIsPaused', async () => {
        // Pausing the token
        pauseFacet = pauseFacet.connect(signer_B)
        await pauseFacet.pause()

        // Using account C (with role)
        scheduledSnapshotsFacet = scheduledSnapshotsFacet.connect(signer_C)

        // trigger scheduled snapshots
        await expect(
            scheduledSnapshotsFacet.triggerPendingScheduledSnapshots()
        ).to.be.rejectedWith('TokenIsPaused')
        await expect(
            scheduledSnapshotsFacet.triggerScheduledSnapshots(1)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN a token WHEN triggerSnapshots THEN transaction succeeds', async () => {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_CORPORATE_ACTION_ROLE, account_C)
        // Using account C (with role)
        equityFacet = equityFacet.connect(signer_C)

        // set dividend
        const currentTimeInSeconds = (await ethers.provider.getBlock('latest'))
            .timestamp
        const dividendsRecordDateInSeconds_1 =
            currentTimeInSeconds + TIME / 1000
        const dividendsRecordDateInSeconds_2 =
            currentTimeInSeconds + (2 * TIME) / 1000
        const dividendsRecordDateInSeconds_3 =
            currentTimeInSeconds + (3 * TIME) / 1000
        const dividendsExecutionDateInSeconds =
            currentTimeInSeconds + (10 * TIME) / 1000
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
        await equityFacet.setDividends(dividendData_2)
        await equityFacet.setDividends(dividendData_3)
        await equityFacet.setDividends(dividendData_1)

        const dividend_2_Id =
            '0x0000000000000000000000000000000000000000000000000000000000000001'
        const dividend_3_Id =
            '0x0000000000000000000000000000000000000000000000000000000000000002'
        const dividend_1_Id =
            '0x0000000000000000000000000000000000000000000000000000000000000003'

        // check schedled snapshots
        scheduledSnapshotsFacet = scheduledSnapshotsFacet.connect(signer_A)

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
        await new Promise((f) => setTimeout(f, TIME + 1000))
        await expect(scheduledSnapshotsFacet.triggerPendingScheduledSnapshots())
            .to.emit(scheduledSnapshotsFacet, 'SnapshotTriggered')
            .withArgs(account_A, 1)

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
        await new Promise((f) => setTimeout(f, TIME + 1000))
        await expect(scheduledSnapshotsFacet.triggerScheduledSnapshots(100))
            .to.emit(scheduledSnapshotsFacet, 'SnapshotTriggered')
            .withArgs(account_A, 2)

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
        await new Promise((f) => setTimeout(f, TIME + 1000))
        await expect(scheduledSnapshotsFacet.triggerScheduledSnapshots(0))
            .to.emit(scheduledSnapshotsFacet, 'SnapshotTriggered')
            .withArgs(account_A, 3)

        scheduledSnapshotCount =
            await scheduledSnapshotsFacet.scheduledSnapshotCount()
        scheduledSnapshots =
            await scheduledSnapshotsFacet.getScheduledSnapshots(0, 100)

        expect(scheduledSnapshotCount).to.equal(0)
        expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount)
    })
})
