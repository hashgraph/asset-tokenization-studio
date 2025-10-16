import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    type ResolverProxy,
    type IERC1410,
    type Pause,
    AdjustBalances,
    ERC20Votes,
    EquityUSA,
} from '@typechain'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployEquityTokenFixture } from '@test/fixtures'

import { executeRbac } from '@test/fixtures/tokens/common.fixture'
import { ATS_ROLES, DEFAULT_PARTITION } from '@scripts'
import { TimeTravel } from '@typechain/contracts/test/testTimeTravel/timeTravel/TimeTravel'

const amount = 1000

describe('ERC20Votes Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let signer_D: SignerWithAddress

    let erc20VotesFacet: ERC20Votes
    let pauseFacet: Pause
    let erc1410Facet: IERC1410
    let adjustBalancesFacet: AdjustBalances
    let timeTravelFacet: TimeTravel
    let equityFacet: EquityUSA

    const ABAF = 200
    const DECIMALS = 2
    const block = 100

    async function checkVotingPowerAfterAdjustment() {
        await timeTravelFacet.changeSystemBlocknumber(block + 1)

        const votesA1 = await erc20VotesFacet.getPastVotes(
            signer_A.address,
            block - 1
        )
        const votesA2 = await erc20VotesFacet.getVotes(signer_A.address)
        const votesB1 = await erc20VotesFacet.getPastVotes(
            signer_B.address,
            block - 1
        )
        const votesB2 = await erc20VotesFacet.getVotes(signer_B.address)
        const totalSupplyA1 = await erc20VotesFacet.getPastTotalSupply(
            block - 1
        )
        const totalSupplyA2 = await erc20VotesFacet.getPastTotalSupply(block)

        expect(votesA1).to.equal(amount)
        expect(votesA2).to.equal(0)
        expect(votesB1).to.equal(0)
        expect(votesB2).to.equal(amount * ABAF)
        expect(totalSupplyA1).to.equal(amount)
        expect(totalSupplyA2).to.equal(amount * ABAF)
    }

    async function deploySecurityFixture() {
        const base = await deployEquityTokenFixture({
            equityDataParams: {
                securityData: {
                    isMultiPartition: true,
                    internalKycActivated: false,
                    erc20VotesActivated: true,
                },
            },
        })
        diamond = base.diamond
        signer_A = base.deployer
        signer_B = base.user1
        signer_C = base.user2
        signer_D = base.user3
        await executeRbac(base.accessControlFacet, [
            {
                role: ATS_ROLES.PAUSER,
                members: [signer_A.address],
            },
            {
                role: ATS_ROLES.ADJUSTMENT_BALANCE,
                members: [signer_A.address],
            },
            {
                role: ATS_ROLES.CORPORATE_ACTION,
                members: [signer_A.address],
            },
            {
                role: ATS_ROLES.ISSUER,
                members: [signer_A.address],
            },
        ])

        erc20VotesFacet = await ethers.getContractAt(
            'ERC20Votes',
            diamond.address
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
        adjustBalancesFacet = await ethers.getContractAt(
            'AdjustBalances',
            diamond.address,
            signer_A
        )
        timeTravelFacet = await ethers.getContractAt(
            'TimeTravelFacet',
            diamond.address,
            signer_A
        )
        equityFacet = await ethers.getContractAt(
            'EquityUSA',
            diamond.address,
            signer_A
        )
    }

    beforeEach(async () => {
        await loadFixture(deploySecurityFixture)
    })

    describe('Initialization', () => {
        it('GIVEN a initialized ERC20Votes WHEN initialize again THEN transaction fails with AlreadyInitialized', async () => {
            await expect(
                erc20VotesFacet.initialize_ERC20Votes(true)
            ).to.be.revertedWithCustomError(
                erc20VotesFacet,
                'AlreadyInitialized'
            )
        })
    })

    describe('Clock and Clock Mode', () => {
        it('GIVEN any state WHEN clock THEN returns current block number', async () => {
            const blockNumber = 1000
            await timeTravelFacet.changeSystemBlocknumber(blockNumber)
            const clockValue = await erc20VotesFacet.clock()
            expect(clockValue).to.equal(blockNumber)
        })

        it('GIVEN any state WHEN CLOCK_MODE THEN returns correct mode string', async () => {
            const clockMode = await erc20VotesFacet.CLOCK_MODE()
            expect(clockMode).to.equal('mode=blocknumber&from=default')
        })
    })

    describe('Delegation', () => {
        beforeEach(async () => {
            // Issue tokens to signer_A.address
            await erc1410Facet.issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: amount,
                data: '0x',
            })
        })

        it('GIVEN a paused token WHEN delegate THEN transaction fails with TokenIsPaused', async () => {
            // Pause the token
            await pauseFacet.pause()

            // Try to delegate while paused
            await expect(
                erc20VotesFacet.delegate(signer_B.address)
            ).to.be.revertedWithCustomError(pauseFacet, 'TokenIsPaused')
        })

        it('GIVEN tokens issued WHEN delegate THEN delegate is set correctly', async () => {
            await expect(erc20VotesFacet.delegate(signer_B.address))
                .to.emit(erc20VotesFacet, 'DelegateChanged')
                .withArgs(
                    signer_A.address,
                    ethers.constants.AddressZero,
                    signer_B.address
                )

            const delegate = await erc20VotesFacet.delegates(signer_A.address)
            expect(delegate).to.equal(signer_B.address)
        })

        it('GIVEN delegation WHEN delegate to same address THEN no event emitted', async () => {
            // First delegation
            await erc20VotesFacet.delegate(signer_B.address)

            // Delegate to same address again
            await expect(
                erc20VotesFacet.delegate(signer_B.address)
            ).to.not.emit(erc20VotesFacet, 'DelegateChanged')
        })

        it('GIVEN delegation WHEN delegate to zero address THEN delegation is removed', async () => {
            await erc20VotesFacet.delegate(signer_B.address)
            await expect(erc20VotesFacet.delegate(ethers.constants.AddressZero))
                .to.emit(erc20VotesFacet, 'DelegateChanged')
                .withArgs(
                    signer_A.address,
                    signer_B.address,
                    ethers.constants.AddressZero
                )

            const delegate = await erc20VotesFacet.delegates(signer_A.address)
            expect(delegate).to.equal(ethers.constants.AddressZero)
        })
    })

    describe('Voting Power', () => {
        async function checkTotalSupply(amount: number) {
            const now = await erc20VotesFacet.clock()
            await timeTravelFacet.changeSystemBlocknumber(now + 100)
            const totalSupply = await erc20VotesFacet.getPastTotalSupply(now)
            expect(totalSupply).to.equal(amount)
        }

        beforeEach(async () => {
            // Issue tokens to signer_A.address
            await erc1410Facet.issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: amount,
                data: '0x',
            })
        })

        it('GIVEN tokens issued WHEN getVotes for delegator THEN returns zero', async () => {
            const votes = await erc20VotesFacet.getVotes(signer_A.address)
            expect(votes).to.equal(0)
        })

        it('GIVEN delegation WHEN getVotes for delegate THEN returns delegated amount', async () => {
            await erc20VotesFacet.delegate(signer_B.address)
            const votes = await erc20VotesFacet.getVotes(signer_B.address)
            expect(votes).to.equal(amount)

            await checkTotalSupply(amount)
        })

        it('GIVEN delegation WHEN delegate changes THEN voting power transfers correctly', async () => {
            await erc20VotesFacet.delegate(signer_B.address)
            const votesB = await erc20VotesFacet.getVotes(signer_B.address)
            expect(votesB).to.equal(amount)

            await erc20VotesFacet.delegate(signer_C.address)
            const votesBAfter = await erc20VotesFacet.getVotes(signer_B.address)
            const votesC = await erc20VotesFacet.getVotes(signer_C.address)
            expect(votesBAfter).to.equal(0)
            expect(votesC).to.equal(amount)

            await checkTotalSupply(amount)
        })

        it('GIVEN delegation WHEN tokens are transferred THEN voting power updates correctly', async () => {
            await erc20VotesFacet.connect(signer_C).delegate(signer_D.address)
            await erc20VotesFacet.connect(signer_A).delegate(signer_B.address)

            // Transfer tokens
            await expect(
                erc1410Facet
                    .connect(signer_A)
                    .transferByPartition(
                        DEFAULT_PARTITION,
                        { to: signer_C.address, value: amount / 2 },
                        '0x'
                    )
            )
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_B.address, amount, amount / 2)
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_D.address, 0, amount / 2)

            const votesB = await erc20VotesFacet.getVotes(signer_B.address)
            const votesD = await erc20VotesFacet.getVotes(signer_D.address)

            expect(votesB).to.equal(amount / 2)
            expect(votesD).to.equal(amount / 2)

            await checkTotalSupply(amount)
        })

        it('GIVEN delegation WHEN tokens are redeemed THEN voting power updates correctly', async () => {
            await erc20VotesFacet.delegate(signer_B.address)

            // Transfer tokens
            await expect(
                erc1410Facet.redeemByPartition(DEFAULT_PARTITION, amount, '0x')
            )
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_B.address, amount, 0)

            const votesB = await erc20VotesFacet.getVotes(signer_B.address)

            expect(votesB).to.equal(0)

            await checkTotalSupply(0)
        })
    })

    describe('Past Votes', () => {
        beforeEach(async () => {
            await timeTravelFacet.changeSystemBlocknumber(1)

            await erc1410Facet.issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: amount,
                data: '0x',
            })
        })

        it('GIVEN current time WHEN getPastVotes with future timepoint THEN reverts', async () => {
            await expect(
                erc20VotesFacet.getPastVotes(signer_A.address, 100)
            ).to.be.revertedWith('ERC20Votes: future lookup')
        })

        it('GIVEN delegation at specific block WHEN getPastVotes THEN returns correct historical votes', async () => {
            const block_1 = 100
            const block_2 = 200
            const block_3 = 300

            await timeTravelFacet.changeSystemBlocknumber(block_1)

            await erc20VotesFacet.delegate(signer_A.address)
            await erc20VotesFacet.connect(signer_B).delegate(signer_B.address)

            await timeTravelFacet.changeSystemBlocknumber(block_2)

            await erc1410Facet.issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: amount,
                data: '0x',
            })

            await timeTravelFacet.changeSystemBlocknumber(block_3)

            await erc1410Facet.issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: amount,
                data: '0x',
            })

            await erc1410Facet.issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_B.address,
                value: amount,
                data: '0x',
            })

            await timeTravelFacet.changeSystemBlocknumber(block_3 + 1)

            const pastVotesA1 = await erc20VotesFacet.getPastVotes(
                signer_A.address,
                block_1
            )
            const pastVotesA2 = await erc20VotesFacet.getPastVotes(
                signer_A.address,
                block_2
            )
            const pastVotesA3 = await erc20VotesFacet.getPastVotes(
                signer_A.address,
                block_3
            )
            const pastVotesB1 = await erc20VotesFacet.getPastVotes(
                signer_B.address,
                block_1
            )
            const pastVotesB2 = await erc20VotesFacet.getPastVotes(
                signer_B.address,
                block_2
            )
            const pastVotesB3 = await erc20VotesFacet.getPastVotes(
                signer_B.address,
                block_3
            )
            const pastTotalSupplyA1 =
                await erc20VotesFacet.getPastTotalSupply(block_1)
            const pastTotalSupplyA2 =
                await erc20VotesFacet.getPastTotalSupply(block_2)
            const pastTotalSupplyA3 =
                await erc20VotesFacet.getPastTotalSupply(block_3)

            expect(pastVotesA1).to.equal(amount)
            expect(pastVotesA2).to.equal(2 * amount)
            expect(pastVotesA3).to.equal(3 * amount)

            expect(pastVotesB1).to.equal(0)
            expect(pastVotesB2).to.equal(0)
            expect(pastVotesB3).to.equal(amount)

            expect(pastTotalSupplyA1).to.equal(amount)
            expect(pastTotalSupplyA2).to.equal(2 * amount)
            expect(pastTotalSupplyA3).to.equal(4 * amount)
        })
    })

    describe('Checkpoints', () => {
        beforeEach(async () => {
            // Issue tokens to signer_A.address
            await erc1410Facet.issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: amount,
                data: '0x',
            })
        })

        it('GIVEN no delegation WHEN numCheckpoints THEN returns zero', async () => {
            const numCheckpoints = await erc20VotesFacet.numCheckpoints(
                signer_A.address
            )
            expect(numCheckpoints).to.equal(0)
        })

        it('GIVEN delegation WHEN numCheckpoints THEN returns correct count', async () => {
            await erc20VotesFacet.delegate(signer_B.address)

            const numCheckpoints = await erc20VotesFacet.numCheckpoints(
                signer_B.address
            )
            expect(numCheckpoints).to.equal(1)
        })

        it('GIVEN delegation WHEN checkpoints THEN returns correct checkpoint data', async () => {
            await erc20VotesFacet.delegate(signer_B.address)

            const checkpoint = await erc20VotesFacet.checkpoints(
                signer_B.address,
                0
            )
            expect(checkpoint.fromBlock).to.be.gt(0)
            expect(checkpoint.votes).to.equal(amount)
        })
    })

    describe('Balance adjustments', () => {
        beforeEach(async () => {
            await timeTravelFacet.changeSystemBlocknumber(1)
            await erc20VotesFacet.delegate(signer_A.address)
            await erc1410Facet.issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: amount,

                data: '0x',
            })
        })

        it('GIVEN an ERC20Votes when adjusting balances twice for same block THEN fails', async () => {
            const ABAF = 200
            const DECIMALS = 2
            await adjustBalancesFacet.adjustBalances(ABAF, DECIMALS)

            await expect(erc20VotesFacet.delegate(signer_B.address))
                .to.be.revertedWithCustomError(
                    erc20VotesFacet,
                    'AbafChangeForBlockForbidden'
                )
                .withArgs(1)
        })

        it('GIVEN an ERC20Votes when adjusting balances and delegating THEN values updated', async () => {
            await timeTravelFacet.changeSystemBlocknumber(block)

            await adjustBalancesFacet.adjustBalances(ABAF, DECIMALS)

            await expect(erc20VotesFacet.delegate(signer_B.address))
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_A.address, amount * ABAF, 0)
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_B.address, 0, amount * ABAF)

            await checkVotingPowerAfterAdjustment()
        })

        it('GIVEN an ERC20Votes when adjusting balances and transferring THEN values updated', async () => {
            await erc20VotesFacet.connect(signer_B).delegate(signer_B.address)

            await timeTravelFacet.changeSystemBlocknumber(block)

            await adjustBalancesFacet.adjustBalances(ABAF, DECIMALS)

            await expect(
                erc1410Facet.transferByPartition(
                    DEFAULT_PARTITION,
                    { to: signer_B.address, value: amount * ABAF },
                    '0x'
                )
            )
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_A.address, amount * ABAF, 0)
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_B.address, 0, amount * ABAF)

            await checkVotingPowerAfterAdjustment()
        })
    })

    describe('Scheduled Balance adjustments', () => {
        beforeEach(async () => {
            await timeTravelFacet.changeSystemBlocknumber(1)
            await timeTravelFacet.changeSystemTimestamp(1)
            await erc20VotesFacet.delegate(signer_A.address)
            await erc1410Facet.issueByPartition({
                partition: DEFAULT_PARTITION,
                tokenHolder: signer_A.address,
                value: amount,

                data: '0x',
            })
        })

        it('GIVEN an ERC20Votes when scheduling a balance adjustment and delegating THEN values updated', async () => {
            const timestamp = 100000

            await equityFacet.setScheduledBalanceAdjustment({
                executionDate: timestamp,
                factor: ABAF,
                decimals: DECIMALS,
            })

            await timeTravelFacet.changeSystemBlocknumber(block)
            await timeTravelFacet.changeSystemTimestamp(timestamp + 1)

            await expect(erc20VotesFacet.delegate(signer_B.address))
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_A.address, amount * ABAF, 0)
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_B.address, 0, amount * ABAF)

            await checkVotingPowerAfterAdjustment()
        })

        it('GIVEN an ERC20Votes when adjusting balances and transferring THEN values updated', async () => {
            await erc20VotesFacet.connect(signer_B).delegate(signer_B.address)

            const timestamp = 100000

            await equityFacet.setScheduledBalanceAdjustment({
                executionDate: timestamp,
                factor: ABAF,
                decimals: DECIMALS,
            })

            await timeTravelFacet.changeSystemBlocknumber(block)
            await timeTravelFacet.changeSystemTimestamp(timestamp + 1)

            await expect(
                erc1410Facet.transferByPartition(
                    DEFAULT_PARTITION,
                    { to: signer_B.address, value: amount * ABAF },
                    '0x'
                )
            )
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_A.address, amount * ABAF, 0)
                .to.emit(erc20VotesFacet, 'DelegateVotesChanged')
                .withArgs(signer_B.address, 0, amount * ABAF)

            await checkVotingPowerAfterAdjustment()
        })
    })
})
