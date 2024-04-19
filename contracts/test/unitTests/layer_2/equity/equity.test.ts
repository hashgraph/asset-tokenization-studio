import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Equity,
    type Pause,
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
import { grantRoleAndPauseToken } from '../../../../scripts/testCommon'
import { time } from '@nomicfoundation/hardhat-network-helpers'

const TIME = 10000
let currentTimeInSeconds = 0
let dividendsRecordDateInSeconds = 0
let dividendsExecutionDateInSeconds = 0
const dividendsAmountPerEquity = 1

let votingRecordDateInSeconds = 0
const countriesControlListType = true
const listOfCountries = 'ES,FR,CH'
const info = 'info'

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

describe('Equity Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string

    let equityFacet: Equity
    let accessControlFacet: AccessControl
    let pauseFacet: Pause

    before(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B, signer_C] = await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address
        account_C = signer_C.address

        currentTimeInSeconds = await time.latest()
        dividendsRecordDateInSeconds = currentTimeInSeconds + TIME
        dividendsExecutionDateInSeconds = currentTimeInSeconds + 10 * TIME
        votingRecordDateInSeconds = currentTimeInSeconds + TIME
        votingData = {
            recordDate: votingRecordDateInSeconds.toString(),
            data: voteData,
        }
        dividendData = {
            recordDate: dividendsRecordDateInSeconds.toString(),
            executionDate: dividendsExecutionDateInSeconds.toString(),
            amount: dividendsAmountPerEquity,
        }
    })

    beforeEach(async () => {
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
            countriesControlListType,
            listOfCountries,
            info,
            init_rbacs
        )

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        equityFacet = await ethers.getContractAt('Equity', diamond.address)

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    })

    describe('Dividends', () => {
        it('GIVEN an account without corporateActions role WHEN setDividends THEN transaction fails with AccountHasNoRole', async () => {
            // Using account C (non role)
            equityFacet = equityFacet.connect(signer_C)

            // set dividend fails
            await expect(
                equityFacet.setDividends(dividendData)
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN a paused Token WHEN setDividends THEN transaction fails with TokenIsPaused', async () => {
            // Granting Role to account C and Pause
            await grantRoleAndPauseToken(
                accessControlFacet,
                pauseFacet,
                _CORPORATE_ACTION_ROLE,
                signer_A,
                signer_B,
                account_C
            )

            // Using account C (with role)
            equityFacet = equityFacet.connect(signer_C)

            // set dividend fails
            await expect(
                equityFacet.setDividends(dividendData)
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN an account with corporateActions role WHEN setDividends with wrong dates THEN transaction fails', async () => {
            // Granting Role to account C
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // Using account C (with role)
            equityFacet = equityFacet.connect(signer_C)

            // set dividend
            const wrongDividendData_1 = {
                recordDate: dividendsExecutionDateInSeconds.toString(),
                executionDate: dividendsRecordDateInSeconds.toString(),
                amount: dividendsAmountPerEquity,
            }

            await expect(
                equityFacet.setDividends(wrongDividendData_1)
            ).to.be.rejectedWith('WrongDates')

            const wrongDividendData_2 = {
                recordDate: (
                    (await ethers.provider.getBlock('latest')).timestamp - 1
                ).toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: dividendsAmountPerEquity,
            }

            await expect(
                equityFacet.setDividends(wrongDividendData_2)
            ).to.be.rejectedWith('WrongTimestamp')
        })

        it('GIVEN an account with corporateActions role WHEN setDividends THEN transaction succeeds', async () => {
            // Granting Role to account C
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // Using account C (with role)
            equityFacet = equityFacet.connect(signer_C)

            // set dividend
            await expect(equityFacet.setDividends(dividendData))
                .to.emit(equityFacet, 'DividendSet')
                .withArgs(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                    1,
                    account_C,
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
            const dividendFor = await equityFacet.getDividendsFor(1, account_A)

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
        })
    })

    describe('Voting rights', () => {
        it('GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole', async () => {
            // Using account C (non role)
            equityFacet = equityFacet.connect(signer_C)

            // set dividend fails
            await expect(equityFacet.setVoting(votingData)).to.be.rejectedWith(
                'AccountHasNoRole'
            )
        })

        it('GIVEN a paused Token WHEN setDividends THEN transaction fails with TokenIsPaused', async () => {
            // Granting Role to account C and Pause
            await grantRoleAndPauseToken(
                accessControlFacet,
                pauseFacet,
                _CORPORATE_ACTION_ROLE,
                signer_A,
                signer_B,
                account_C
            )

            // Using account C (with role)
            equityFacet = equityFacet.connect(signer_C)

            // set dividend fails
            await expect(equityFacet.setVoting(votingData)).to.be.rejectedWith(
                'TokenIsPaused'
            )
        })

        it('GIVEN an account with corporateActions role WHEN setVoting THEN transaction succeeds', async () => {
            // Granting Role to account C
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // Using account C (with role)
            equityFacet = equityFacet.connect(signer_C)

            // set dividend
            await expect(equityFacet.setVoting(votingData))
                .to.emit(equityFacet, 'VotingSet')
                .withArgs(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                    1,
                    account_C,
                    votingRecordDateInSeconds,
                    voteData
                )

            // check list members
            // await expect(equityFacet.getVoting(1000)).to.be.rejectedWith(
            //     'WrongIndexForAction'
            // )

            const listCount = await equityFacet.getVotingCount()
            const voting = await equityFacet.getVoting(1)
            const votingFor = await equityFacet.getVotingFor(1, account_A)

            expect(listCount).to.equal(1)
            expect(voting.snapshotId).to.equal(0)
            expect(voting.voting.recordDate).to.equal(votingRecordDateInSeconds)
            expect(voting.voting.data).to.equal(voteData)
            expect(votingFor.recordDate).to.equal(dividendsRecordDateInSeconds)
            expect(votingFor.data).to.equal(voteData)
            expect(votingFor.tokenBalance).to.equal(0)
            expect(votingFor.recordDateReached).to.equal(false)
        })
    })
})
