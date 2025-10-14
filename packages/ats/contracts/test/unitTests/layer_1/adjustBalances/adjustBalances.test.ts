import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    type ResolverProxy,
    type AdjustBalances,
    type Pause,
    type IERC1410,
    type AccessControl,
    Equity,
    ScheduledCrossOrderedTasks,
    Kyc,
    SsiManagement,
} from '@typechain'
import { grantRoleAndPauseToken } from '@test'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { ATS_ROLES, dateToUnixTimestamp } from '@scripts'
import { deployEquityTokenFixture, MAX_UINT256 } from '@test/fixtures'
import { executeRbac } from '@test/fixtures/tokens/common.fixture'
import { TimeTravel } from '@typechain/contracts/test/testTimeTravel/timeTravel/TimeTravel'

const amount = 1
const balanceOf_B_Original = [20 * amount, 200 * amount]
const _PARTITION_ID_2 =
    '0x0000000000000000000000000000000000000000000000000000000000000002'
const adjustFactor = 253
const adjustDecimals = 2
const EMPTY_VC_ID = ''

describe('Adjust Balances Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let erc1410Facet: IERC1410
    let adjustBalancesFacet: AdjustBalances
    let accessControlFacet: AccessControl
    let pauseFacet: Pause
    let equityFacet: Equity
    let scheduledTasksFacet: ScheduledCrossOrderedTasks
    let timeTravelFacet: TimeTravel
    let kycFacet: Kyc
    let ssiManagementFacet: SsiManagement

    async function deploySecurityFixtureMultiPartition() {
        const base = await deployEquityTokenFixture({
            securityData: {
                isMultiPartition: true,
            },
        })
        diamond = base.diamond
        signer_A = base.deployer
        signer_B = base.user1
        signer_C = base.user2
        await executeRbac(base.accessControlFacet, [
            {
                role: ATS_ROLES.PAUSER,
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

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        erc1410Facet = await ethers.getContractAt('IERC1410', diamond.address)

        adjustBalancesFacet = await ethers.getContractAt(
            'AdjustBalances',
            diamond.address
        )

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)

        equityFacet = await ethers.getContractAt('Equity', diamond.address)

        scheduledTasksFacet = await ethers.getContractAt(
            'ScheduledCrossOrderedTasksFacetTimeTravel',
            diamond.address
        )

        timeTravelFacet = await ethers.getContractAt(
            'TimeTravelFacet',
            diamond.address
        )

        kycFacet = await ethers.getContractAt('Kyc', diamond.address)
        ssiManagementFacet = await ethers.getContractAt(
            'SsiManagement',
            diamond.address
        )
    }

    // afterEach(async () => {
    //     await timeTravelFacet.resetSystemTimestamp()
    // })

    beforeEach(async () => {
        await loadFixture(deploySecurityFixtureMultiPartition)
    })

    it('GIVEN an account without adjustBalances role WHEN adjustBalances THEN transaction fails with AccountHasNoRole', async () => {
        // adjustBalances fails
        await expect(
            adjustBalancesFacet
                .connect(signer_C)
                .adjustBalances(adjustFactor, adjustDecimals)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN a paused Token WHEN adjustBalances THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            ATS_ROLES.ADJUSTMENT_BALANCE,
            signer_A,
            signer_B,
            signer_C.address
        )

        // adjustBalances fails
        await expect(
            adjustBalancesFacet
                .connect(signer_C)
                .adjustBalances(adjustFactor, adjustDecimals)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN a Token WHEN adjustBalances with factor set at 0 THEN transaction fails with FactorIsZero', async () => {
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES.ADJUSTMENT_BALANCE, signer_C.address)

        // adjustBalances fails
        await expect(
            adjustBalancesFacet
                .connect(signer_C)
                .adjustBalances(0, adjustDecimals)
        ).to.be.revertedWithCustomError(adjustBalancesFacet, 'FactorIsZero')
    })

    it('GIVEN an account with adjustBalance role WHEN adjustBalances THEN scheduled tasks get executed succeeds', async () => {
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES.ADJUSTMENT_BALANCE, signer_A.address)
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES.ISSUER, signer_A.address)
        await accessControlFacet
            .connect(signer_A)
            .grantRole(ATS_ROLES.CORPORATE_ACTION, signer_A.address)

        await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address)
        await kycFacet
            .connect(signer_B)
            .grantKyc(
                signer_B.address,
                EMPTY_VC_ID,
                0,
                MAX_UINT256,
                signer_A.address
            )

        await erc1410Facet.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_2,
            tokenHolder: signer_B.address,
            value: balanceOf_B_Original,
            data: '0x',
        })

        // schedule tasks
        const dividendsRecordDateInSeconds_1 =
            dateToUnixTimestamp(`2030-01-01T00:00:06Z`)
        const dividendsExecutionDateInSeconds =
            dateToUnixTimestamp(`2030-01-01T00:01:00Z`)
        const dividendsAmountPerEquity = 1
        const dividendData_1 = {
            recordDate: dividendsRecordDateInSeconds_1.toString(),
            executionDate: dividendsExecutionDateInSeconds.toString(),
            amount: dividendsAmountPerEquity,
        }

        await equityFacet.connect(signer_A).setDividends(dividendData_1)

        const balanceAdjustmentExecutionDateInSeconds_1 =
            dateToUnixTimestamp(`2030-01-01T00:00:07Z`)

        const balanceAdjustmentData_1 = {
            executionDate: balanceAdjustmentExecutionDateInSeconds_1.toString(),
            factor: adjustFactor,
            decimals: adjustDecimals,
        }

        await equityFacet
            .connect(signer_A)
            .setScheduledBalanceAdjustment(balanceAdjustmentData_1)

        const tasks_count_Before =
            await scheduledTasksFacet.scheduledCrossOrderedTaskCount()

        //-------------------------
        await timeTravelFacet.changeSystemTimestamp(
            balanceAdjustmentExecutionDateInSeconds_1 + 1
        )

        // balance adjustment
        await adjustBalancesFacet.connect(signer_A).adjustBalances(1, 0)

        const tasks_count_After =
            await scheduledTasksFacet.scheduledCrossOrderedTaskCount()

        expect(tasks_count_Before).to.be.equal(2)
        expect(tasks_count_After).to.be.equal(0)
    })
})
