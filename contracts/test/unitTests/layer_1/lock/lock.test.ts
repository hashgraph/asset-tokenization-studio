import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Lock,
    Pause,
    ERC1410ScheduledSnapshot,
} from '../../../../typechain-types'
import { deployEnvironment } from '../../../../scripts/deployEnvironmentByRpc'
import {
    _PAUSER_ROLE,
    _LOCKER_ROLE,
    _ISSUER_ROLE,
} from '../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { takeSnapshot, time } from '@nomicfoundation/hardhat-network-helpers'
import { SnapshotRestorer } from '@nomicfoundation/hardhat-network-helpers/src/helpers/takeSnapshot'

const _NON_DEFAULT_PARTITION =
    '0x0000000000000000000000000000000000000000000000000000000000000011'
const _DEFAULT_PARTITION =
    '0x0000000000000000000000000000000000000000000000000000000000000001'
const _AMOUNT = 1000

describe('Lock Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let signer_D: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string
    let account_D: string

    let lockFacet: Lock
    let pauseFacet: Pause
    let erc1410Facet: ERC1410ScheduledSnapshot

    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60
    let currentTimestamp = 0
    let expirationTimestamp = 0

    let snapshot: SnapshotRestorer

    before(async () => {
        snapshot = await takeSnapshot()
    })

    after(async () => {
        await snapshot.restore()
    })

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B, signer_C, signer_D] = await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address
        account_C = signer_C.address
        account_D = signer_D.address

        await deployEnvironment()

        currentTimestamp = (await ethers.provider.getBlock('latest')).timestamp
        expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS
    })

    describe('Multi-partition enabled', () => {
        beforeEach(async () => {
            const rbacIssuer: Rbac = {
                role: _ISSUER_ROLE,
                members: [account_B],
            }
            const rbacLocker: Rbac = {
                role: _LOCKER_ROLE,
                members: [account_C],
            }
            const rbacPausable: Rbac = {
                role: _PAUSER_ROLE,
                members: [account_D],
            }
            const init_rbacs: Rbac[] = [rbacIssuer, rbacLocker, rbacPausable]

            diamond = await deployEquityFromFactory(
                account_A,
                false,
                true,
                true,
                'TEST_Lock',
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

            lockFacet = await ethers.getContractAt(
                'Lock',
                diamond.address,
                signer_C
            )
            pauseFacet = await ethers.getContractAt(
                'Pause',
                diamond.address,
                signer_D
            )
            erc1410Facet = await ethers.getContractAt(
                'ERC1410ScheduledSnapshot',
                diamond.address,
                signer_B
            )
        })

        describe('Paused', () => {
            beforeEach(async () => {
                // Pausing the token
                await pauseFacet.pause()
            })

            it('GIVEN a paused Token WHEN lockByPartition THEN transaction fails with TokenIsPaused', async () => {
                // lockByPartition with data fails
                await expect(
                    lockFacet.lockByPartition(
                        _NON_DEFAULT_PARTITION,
                        _AMOUNT,
                        account_A,
                        currentTimestamp
                    )
                ).to.be.rejectedWith('TokenIsPaused')
            })

            it('GIVEN a paused Token WHEN releaseByPartition THEN transaction fails with TokenIsPaused', async () => {
                // transfer from with data fails
                await expect(
                    lockFacet.releaseByPartition(
                        _NON_DEFAULT_PARTITION,
                        1,
                        account_A
                    )
                ).to.be.rejectedWith('TokenIsPaused')
            })

            it('GIVEN a paused Token WHEN lock THEN transaction fails with TokenIsPaused', async () => {
                // lockByPartition with data fails
                await expect(
                    lockFacet.lock(_AMOUNT, account_A, currentTimestamp)
                ).to.be.rejectedWith('TokenIsPaused')
            })

            it('GIVEN a paused Token WHEN release THEN transaction fails with TokenIsPaused', async () => {
                // transfer from with data fails
                await expect(
                    lockFacet.release(1, account_A)
                ).to.be.rejectedWith('TokenIsPaused')
            })
        })

        describe('AccessControl', () => {
            it('GIVEN an account without LOCKER role WHEN lockByPartition THEN transaction fails with AccountHasNoRole', async () => {
                // add to list fails
                await expect(
                    lockFacet
                        .connect(signer_D)
                        .lockByPartition(
                            _NON_DEFAULT_PARTITION,
                            _AMOUNT,
                            account_A,
                            currentTimestamp
                        )
                ).to.be.rejectedWith('AccountHasNoRole')
            })

            it('GIVEN an account without LOCKER role WHEN lock THEN transaction fails with AccountHasNoRole', async () => {
                // add to list fails
                await expect(
                    lockFacet
                        .connect(signer_D)
                        .lock(_AMOUNT, account_A, currentTimestamp)
                ).to.be.rejectedWith('AccountHasNoRole')
            })
        })

        describe('multi-partition transactions are enabled', () => {
            it('GIVEN a token with multi-partition enabled GIVEN lock THEN fails with NotAllowedInMultiPartitionMode', async () => {
                await expect(
                    lockFacet.lock(_AMOUNT, account_A, currentTimestamp)
                ).to.be.revertedWithCustomError(
                    lockFacet,
                    'NotAllowedInMultiPartitionMode'
                )
            })

            it('GIVEN a token with multi-partition enabled GIVEN release THEN fails with NotAllowedInMultiPartitionMode', async () => {
                await expect(
                    lockFacet.release(1, account_A)
                ).to.be.revertedWithCustomError(
                    lockFacet,
                    'NotAllowedInMultiPartitionMode'
                )
            })
        })

        describe('lockByPartition', () => {
            it('GIVEN a expiration timestamp in past WHEN lockByPartition THEN transaction fails with WrongExpirationTimestamp', async () => {
                await expect(
                    lockFacet.lockByPartition(
                        _NON_DEFAULT_PARTITION,
                        _AMOUNT,
                        account_A,
                        currentTimestamp - ONE_YEAR_IN_SECONDS
                    )
                ).to.eventually.be.rejectedWith(Error)
            })

            it('GIVEN a non valid partition WHEN lockByPartition THEN transaction fails with InvalidPartition', async () => {
                await expect(
                    lockFacet.lockByPartition(
                        _NON_DEFAULT_PARTITION,
                        _AMOUNT,
                        account_A,
                        expirationTimestamp
                    )
                )
                    .to.be.revertedWithCustomError(
                        lockFacet,
                        'InvalidPartition'
                    )
                    .withArgs(account_A, _NON_DEFAULT_PARTITION)
            })

            it('GIVEN a valid partition WHEN lockByPartition with insufficient balance THEN transaction fails with InsufficientBalance', async () => {
                await erc1410Facet.issueByPartition(
                    _NON_DEFAULT_PARTITION,
                    account_A,
                    _AMOUNT - 1,
                    '0x'
                )

                await expect(
                    lockFacet.lockByPartition(
                        _NON_DEFAULT_PARTITION,
                        _AMOUNT,
                        account_A,
                        expirationTimestamp
                    )
                )
                    .to.be.revertedWithCustomError(
                        lockFacet,
                        'InsufficientBalance'
                    )
                    .withArgs(
                        account_A,
                        _AMOUNT - 1,
                        _AMOUNT,
                        _NON_DEFAULT_PARTITION
                    )
            })

            it('GIVEN a valid partition WHEN lockByPartition with enough balance THEN transaction success', async () => {
                await erc1410Facet.issueByPartition(
                    _NON_DEFAULT_PARTITION,
                    account_A,
                    _AMOUNT * 2,
                    '0x'
                )

                await expect(
                    lockFacet.lockByPartition(
                        _NON_DEFAULT_PARTITION,
                        _AMOUNT,
                        account_A,
                        expirationTimestamp
                    )
                )
                    .to.emit(lockFacet, 'LockedByPartition')
                    .withArgs(
                        account_C,
                        account_A,
                        _NON_DEFAULT_PARTITION,
                        1,
                        _AMOUNT,
                        expirationTimestamp
                    )

                expect(
                    await lockFacet.getLockedAmountForByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await lockFacet.getLockCountForByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(1)
                expect(
                    await lockFacet.getLocksIdForByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A,
                        0,
                        1
                    )
                ).to.deep.equal([1n])
                expect(
                    await lockFacet.getLockForByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A,
                        1
                    )
                ).to.deep.equal([_AMOUNT, expirationTimestamp])

                expect(await lockFacet.getLockedAmountFor(account_A)).to.equal(
                    0
                )
                expect(await lockFacet.getLockCountFor(account_A)).to.equal(0)
                expect(
                    await lockFacet.getLocksIdFor(account_A, 0, 1)
                ).to.deep.equal([])
                expect(await lockFacet.getLockFor(account_A, 1)).to.deep.equal([
                    0, 0,
                ])

                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await erc1410Facet.totalSupplyByPartition(
                        _NON_DEFAULT_PARTITION
                    )
                ).to.equal(_AMOUNT * 2)
            })
        })

        describe('Release by partition', () => {
            it('GIVEN a non valid lockId WHEN releaseByPartition THEN transaction fails with InvalidLockId', async () => {
                await expect(
                    lockFacet.releaseByPartition(
                        _NON_DEFAULT_PARTITION,
                        10,
                        account_A
                    )
                ).to.be.revertedWithCustomError(lockFacet, 'WrongLockId')
            })

            it('GIVEN a valid lockId but timestamp is not reached WHEN releaseByPartition THEN transaction fails with LockExpirationNotReached', async () => {
                await erc1410Facet.issueByPartition(
                    _NON_DEFAULT_PARTITION,
                    account_A,
                    _AMOUNT,
                    '0x'
                )
                await lockFacet.lockByPartition(
                    _NON_DEFAULT_PARTITION,
                    _AMOUNT,
                    account_A,
                    expirationTimestamp
                )

                await expect(
                    lockFacet.releaseByPartition(
                        _NON_DEFAULT_PARTITION,
                        1,
                        account_A
                    )
                ).to.be.revertedWithCustomError(
                    lockFacet,
                    'LockExpirationNotReached'
                )
            })

            it('GIVEN a valid lockId and timestamp is reached WHEN releaseByPartition THEN transaction success', async () => {
                await erc1410Facet.issueByPartition(
                    _NON_DEFAULT_PARTITION,
                    account_A,
                    _AMOUNT,
                    '0x'
                )
                await lockFacet.lockByPartition(
                    _NON_DEFAULT_PARTITION,
                    _AMOUNT,
                    account_A,
                    expirationTimestamp
                )

                await time.setNextBlockTimestamp(expirationTimestamp + 1)
                await expect(
                    lockFacet.releaseByPartition(
                        _NON_DEFAULT_PARTITION,
                        1,
                        account_A
                    )
                )
                    .to.emit(lockFacet, 'LockByPartitionReleased')
                    .withArgs(account_C, account_A, _NON_DEFAULT_PARTITION, 1)

                expect(
                    await lockFacet.getLockedAmountForByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(0)
                expect(
                    await lockFacet.getLockCountForByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(0)
                expect(
                    await lockFacet.getLocksIdForByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A,
                        0,
                        1
                    )
                ).to.deep.equal([])
                expect(
                    await lockFacet.getLockForByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A,
                        1
                    )
                ).to.deep.equal([0, 0])

                expect(await lockFacet.getLockedAmountFor(account_A)).to.equal(
                    0
                )
                expect(await lockFacet.getLockCountFor(account_A)).to.equal(0)
                expect(
                    await lockFacet.getLocksIdFor(account_A, 0, 1)
                ).to.deep.equal([])
                expect(await lockFacet.getLockFor(account_A, 1)).to.deep.equal([
                    0, 0,
                ])

                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await erc1410Facet.totalSupplyByPartition(
                        _NON_DEFAULT_PARTITION
                    )
                ).to.equal(_AMOUNT)
            })
        })
    })

    describe('Multi-partition disabled', () => {
        beforeEach(async () => {
            const rbacIssuer: Rbac = {
                role: _ISSUER_ROLE,
                members: [account_B],
            }
            const rbacLocker: Rbac = {
                role: _LOCKER_ROLE,
                members: [account_C],
            }
            const rbacPausable: Rbac = {
                role: _PAUSER_ROLE,
                members: [account_D],
            }
            const init_rbacs: Rbac[] = [rbacIssuer, rbacLocker, rbacPausable]

            diamond = await deployEquityFromFactory(
                account_A,
                false,
                true,
                false,
                'TEST_Lock',
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

            lockFacet = await ethers.getContractAt(
                'Lock',
                diamond.address,
                signer_C
            )
            pauseFacet = await ethers.getContractAt(
                'Pause',
                diamond.address,
                signer_D
            )
            erc1410Facet = await ethers.getContractAt(
                'ERC1410ScheduledSnapshot',
                diamond.address,
                signer_B
            )
        })

        describe('multi-partition transactions arent enabled', () => {
            it('GIVEN a token with multi-partition enabled GIVEN lockByPartition THEN fails with NotAllowedInMultiPartitionMode', async () => {
                await expect(
                    lockFacet.lockByPartition(
                        _NON_DEFAULT_PARTITION,
                        _AMOUNT,
                        account_A,
                        currentTimestamp
                    )
                )
                    .to.be.revertedWithCustomError(
                        lockFacet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_NON_DEFAULT_PARTITION)
            })

            it('GIVEN a token with multi-partition enabled GIVEN releaseByPartition THEN fails with NotAllowedInMultiPartitionMode', async () => {
                await expect(
                    lockFacet.releaseByPartition(
                        _NON_DEFAULT_PARTITION,
                        1,
                        account_A
                    )
                )
                    .to.be.revertedWithCustomError(
                        lockFacet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_NON_DEFAULT_PARTITION)
            })
        })

        describe('lock', () => {
            it('GIVEN a valid partition WHEN lockByPartition with enough balance THEN transaction success', async () => {
                await erc1410Facet.issueByPartition(
                    _DEFAULT_PARTITION,
                    account_A,
                    _AMOUNT * 2,
                    '0x'
                )

                await expect(
                    lockFacet.lockByPartition(
                        _DEFAULT_PARTITION,
                        _AMOUNT,
                        account_A,
                        expirationTimestamp
                    )
                )
                    .to.emit(lockFacet, 'LockedByPartition')
                    .withArgs(
                        account_C,
                        account_A,
                        _DEFAULT_PARTITION,
                        1,
                        _AMOUNT,
                        expirationTimestamp
                    )

                expect(
                    await lockFacet.getLockedAmountForByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await lockFacet.getLockCountForByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(1)
                expect(
                    await lockFacet.getLocksIdForByPartition(
                        _DEFAULT_PARTITION,
                        account_A,
                        0,
                        1
                    )
                ).to.deep.equal([1n])
                expect(
                    await lockFacet.getLockForByPartition(
                        _DEFAULT_PARTITION,
                        account_A,
                        1
                    )
                ).to.deep.equal([_AMOUNT, expirationTimestamp])

                expect(await lockFacet.getLockedAmountFor(account_A)).to.equal(
                    _AMOUNT
                )
                expect(await lockFacet.getLockCountFor(account_A)).to.equal(1)
                expect(
                    await lockFacet.getLocksIdFor(account_A, 0, 1)
                ).to.deep.equal([1n])
                expect(await lockFacet.getLockFor(account_A, 1)).to.deep.equal([
                    _AMOUNT,
                    expirationTimestamp,
                ])

                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await erc1410Facet.totalSupplyByPartition(
                        _DEFAULT_PARTITION
                    )
                ).to.equal(_AMOUNT * 2)
            })

            it('GIVEN a expiration timestamp in past WHEN lock THEN transaction fails with WrongExpirationTimestamp', async () => {
                await expect(
                    lockFacet.lock(
                        _AMOUNT,
                        account_A,
                        currentTimestamp - ONE_YEAR_IN_SECONDS
                    )
                ).to.eventually.be.rejectedWith(Error)
            })

            it('GIVEN a valid partition WHEN lock with enough balance THEN transaction success', async () => {
                await erc1410Facet.issueByPartition(
                    _DEFAULT_PARTITION,
                    account_A,
                    _AMOUNT * 2,
                    '0x'
                )

                await expect(
                    lockFacet.lock(_AMOUNT, account_A, expirationTimestamp)
                )
                    .to.emit(lockFacet, 'LockedByPartition')
                    .withArgs(
                        account_C,
                        account_A,
                        _DEFAULT_PARTITION,
                        1,
                        _AMOUNT,
                        expirationTimestamp
                    )

                expect(
                    await lockFacet.getLockedAmountForByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await lockFacet.getLockCountForByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(1)
                expect(
                    await lockFacet.getLocksIdForByPartition(
                        _DEFAULT_PARTITION,
                        account_A,
                        0,
                        1
                    )
                ).to.deep.equal([1n])
                expect(
                    await lockFacet.getLockForByPartition(
                        _DEFAULT_PARTITION,
                        account_A,
                        1
                    )
                ).to.deep.equal([_AMOUNT, expirationTimestamp])

                expect(await lockFacet.getLockedAmountFor(account_A)).to.equal(
                    _AMOUNT
                )
                expect(await lockFacet.getLockCountFor(account_A)).to.equal(1)
                expect(
                    await lockFacet.getLocksIdFor(account_A, 0, 1)
                ).to.deep.equal([1n])
                expect(await lockFacet.getLockFor(account_A, 1)).to.deep.equal([
                    _AMOUNT,
                    expirationTimestamp,
                ])

                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await erc1410Facet.totalSupplyByPartition(
                        _DEFAULT_PARTITION
                    )
                ).to.equal(_AMOUNT * 2)
            })
        })

        describe('release', () => {
            it('GIVEN a valid lockId and timestamp is reached WHEN releaseByPartition THEN transaction success', async () => {
                await erc1410Facet.issueByPartition(
                    _DEFAULT_PARTITION,
                    account_A,
                    _AMOUNT,
                    '0x'
                )
                await lockFacet.lockByPartition(
                    _DEFAULT_PARTITION,
                    _AMOUNT,
                    account_A,
                    expirationTimestamp
                )

                await time.setNextBlockTimestamp(expirationTimestamp + 1)
                await expect(
                    lockFacet.releaseByPartition(
                        _DEFAULT_PARTITION,
                        1,
                        account_A
                    )
                )
                    .to.emit(lockFacet, 'LockByPartitionReleased')
                    .withArgs(account_C, account_A, _DEFAULT_PARTITION, 1)

                expect(
                    await lockFacet.getLockedAmountForByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(0)
                expect(
                    await lockFacet.getLockCountForByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(0)
                expect(
                    await lockFacet.getLocksIdForByPartition(
                        _DEFAULT_PARTITION,
                        account_A,
                        0,
                        1
                    )
                ).to.deep.equal([])
                expect(
                    await lockFacet.getLockForByPartition(
                        _DEFAULT_PARTITION,
                        account_A,
                        1
                    )
                ).to.deep.equal([0, 0])

                expect(await lockFacet.getLockedAmountFor(account_A)).to.equal(
                    0
                )
                expect(await lockFacet.getLockCountFor(account_A)).to.equal(0)
                expect(
                    await lockFacet.getLocksIdFor(account_A, 0, 1)
                ).to.deep.equal([])
                expect(await lockFacet.getLockFor(account_A, 1)).to.deep.equal([
                    0, 0,
                ])

                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await erc1410Facet.totalSupplyByPartition(
                        _DEFAULT_PARTITION
                    )
                ).to.equal(_AMOUNT)
            })

            it('GIVEN a non valid lockId WHEN release THEN transaction fails with InvalidLockId', async () => {
                await expect(
                    lockFacet.release(10, account_A)
                ).to.be.revertedWithCustomError(lockFacet, 'WrongLockId')
            })

            it('GIVEN a valid lockId but timestamp is not reached WHEN release THEN transaction fails with LockExpirationNotReached', async () => {
                await erc1410Facet.issueByPartition(
                    _DEFAULT_PARTITION,
                    account_A,
                    _AMOUNT,
                    '0x'
                )
                await lockFacet.lockByPartition(
                    _DEFAULT_PARTITION,
                    _AMOUNT,
                    account_A,
                    expirationTimestamp
                )

                await expect(
                    lockFacet.release(1, account_A)
                ).to.be.revertedWithCustomError(
                    lockFacet,
                    'LockExpirationNotReached'
                )
            })

            it('GIVEN a valid lockId and timestamp is reached WHEN releaseByPartition THEN transaction success', async () => {
                await erc1410Facet.issueByPartition(
                    _DEFAULT_PARTITION,
                    account_A,
                    _AMOUNT,
                    '0x'
                )
                await expect(
                    lockFacet.lock(_AMOUNT - 1, account_A, expirationTimestamp)
                )
                    .to.emit(lockFacet, 'LockedByPartition')
                    .withArgs(
                        account_C,
                        account_A,
                        _DEFAULT_PARTITION,
                        1,
                        _AMOUNT - 1,
                        expirationTimestamp
                    )
                await expect(lockFacet.lock(1, account_A, expirationTimestamp))
                    .to.emit(lockFacet, 'LockedByPartition')
                    .withArgs(
                        account_C,
                        account_A,
                        _DEFAULT_PARTITION,
                        2,
                        1,
                        expirationTimestamp
                    )

                await time.setNextBlockTimestamp(expirationTimestamp + 1)
                await expect(lockFacet.release(1, account_A))
                    .to.emit(lockFacet, 'LockByPartitionReleased')
                    .withArgs(account_C, account_A, _DEFAULT_PARTITION, 1)
                await expect(lockFacet.release(2, account_A))
                    .to.emit(lockFacet, 'LockByPartitionReleased')
                    .withArgs(account_C, account_A, _DEFAULT_PARTITION, 2)

                expect(
                    await lockFacet.getLockedAmountForByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(0)
                expect(
                    await lockFacet.getLockCountForByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(0)
                expect(
                    await lockFacet.getLocksIdForByPartition(
                        _DEFAULT_PARTITION,
                        account_A,
                        0,
                        1
                    )
                ).to.deep.equal([])
                expect(
                    await lockFacet.getLockForByPartition(
                        _DEFAULT_PARTITION,
                        account_A,
                        1
                    )
                ).to.deep.equal([0, 0])

                expect(await lockFacet.getLockedAmountFor(account_A)).to.equal(
                    0
                )
                expect(await lockFacet.getLockCountFor(account_A)).to.equal(0)
                expect(
                    await lockFacet.getLocksIdFor(account_A, 0, 1)
                ).to.deep.equal([])
                expect(await lockFacet.getLockFor(account_A, 1)).to.deep.equal([
                    0, 0,
                ])

                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await erc1410Facet.totalSupplyByPartition(
                        _DEFAULT_PARTITION
                    )
                ).to.equal(_AMOUNT)
            })
        })
    })
})
