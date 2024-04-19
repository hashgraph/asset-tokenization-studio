import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Lock,
    Pause,
    ERC1410ScheduledSnapshot,
    TransferAndLock,
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

const _NON_DEFAULT_PARTITION =
    '0x0000000000000000000000000000000000000000000000000000000000000011'
const _DEFAULT_PARTITION =
    '0x0000000000000000000000000000000000000000000000000000000000000001'
const _AMOUNT = 1000

describe('Transfer and lock Tests', () => {
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
    let transferAndLockFacet: TransferAndLock
    let pauseFacet: Pause
    let erc1410Facet: ERC1410ScheduledSnapshot

    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60
    let currentTimestamp = 0
    let expirationTimestamp = 0

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
            transferAndLockFacet = await ethers.getContractAt(
                'TransferAndLock',
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

            it('GIVEN a paused Token WHEN transferAndLockByPartition THEN transaction fails with TokenIsPaused', async () => {
                // lockByPartition with data fails
                await expect(
                    transferAndLockFacet.transferAndLockByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_B,
                        _AMOUNT,
                        '0x',
                        currentTimestamp
                    )
                ).to.be.rejectedWith('TokenIsPaused')
            })

            it('GIVEN a paused Token WHEN transferAndLock THEN transaction fails with TokenIsPaused', async () => {
                // transfer from with data fails
                await expect(
                    transferAndLockFacet.transferAndLock(
                        account_B,
                        _AMOUNT,
                        '0x',
                        currentTimestamp
                    )
                ).to.be.rejectedWith('TokenIsPaused')
            })
        })

        describe('AccessControl', () => {
            it('GIVEN an account without LOCKER role WHEN transferAndLockByPartition THEN transaction fails with AccountHasNoRole', async () => {
                // add to list fails
                await expect(
                    transferAndLockFacet
                        .connect(signer_D)
                        .transferAndLockByPartition(
                            _NON_DEFAULT_PARTITION,
                            account_B,
                            _AMOUNT,
                            '0x',
                            currentTimestamp
                        )
                ).to.be.rejectedWith('AccountHasNoRole')
            })

            it('GIVEN an account without LOCKER role WHEN transferAndLock THEN transaction fails with AccountHasNoRole', async () => {
                // add to list fails
                await expect(
                    transferAndLockFacet
                        .connect(signer_D)
                        .transferAndLock(
                            account_B,
                            _AMOUNT,
                            '0x',
                            currentTimestamp
                        )
                ).to.be.rejectedWith('AccountHasNoRole')
            })
        })

        describe('multi-partition transactions are enabled', () => {
            it('GIVEN a token with multi-partition enabled GIVEN transferAndLock THEN fails with NotAllowedInMultiPartitionMode', async () => {
                await expect(
                    transferAndLockFacet.transferAndLock(
                        account_B,
                        _AMOUNT,
                        '0x',
                        currentTimestamp
                    )
                ).to.be.revertedWithCustomError(
                    lockFacet,
                    'NotAllowedInMultiPartitionMode'
                )
            })
        })

        describe('transferAndLockByPartition', () => {
            it('GIVEN a expiration timestamp in past WHEN transferAndLockByPartition THEN transaction fails with WrongExpirationTimestamp', async () => {
                await expect(
                    transferAndLockFacet.transferAndLockByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_B,
                        _AMOUNT,
                        '0x',
                        currentTimestamp - ONE_YEAR_IN_SECONDS
                    )
                ).to.be.rejectedWith('WrongExpirationTimestamp')
            })

            it('GIVEN a non valid partition WHEN transferAndLockByPartition THEN transaction fails with InvalidPartition', async () => {
                await expect(
                    transferAndLockFacet.transferAndLockByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_B,
                        _AMOUNT,
                        '0x',
                        expirationTimestamp
                    )
                )
                    .to.be.revertedWithCustomError(
                        lockFacet,
                        'InvalidPartition'
                    )
                    .withArgs(account_C, _NON_DEFAULT_PARTITION)
            })

            it('GIVEN a valid partition WHEN transferAndLockByPartition with enough balance THEN transaction success', async () => {
                await erc1410Facet.issueByPartition(
                    _NON_DEFAULT_PARTITION,
                    account_C,
                    _AMOUNT * 2,
                    '0x'
                )

                await expect(
                    transferAndLockFacet.transferAndLockByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A,
                        _AMOUNT,
                        '0x',
                        expirationTimestamp
                    )
                )
                    .to.emit(transferAndLockFacet, 'TransferByPartition')
                    .withArgs(
                        _NON_DEFAULT_PARTITION,
                        account_C,
                        account_C,
                        account_A,
                        _AMOUNT,
                        '0x',
                        '0x'
                    )
                    .to.emit(
                        transferAndLockFacet,
                        'PartitionTransferredAndLocked'
                    )
                    .withArgs(
                        _NON_DEFAULT_PARTITION,
                        account_C,
                        account_A,
                        _AMOUNT,
                        '0x',
                        expirationTimestamp,
                        1
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

                expect(await lockFacet.getLockedAmountFor(account_C)).to.equal(
                    0
                )
                expect(await lockFacet.getLockCountFor(account_C)).to.equal(0)
                expect(
                    await lockFacet.getLocksIdFor(account_C, 0, 1)
                ).to.deep.equal([])
                expect(await lockFacet.getLockFor(account_C, 1)).to.deep.equal([
                    0, 0,
                ])

                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_C
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(0)
                expect(
                    await erc1410Facet.totalSupplyByPartition(
                        _NON_DEFAULT_PARTITION
                    )
                ).to.equal(_AMOUNT * 2)
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
            transferAndLockFacet = await ethers.getContractAt(
                'TransferAndLock',
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
            it('GIVEN a token with multi-partition enabled GIVEN transferAndLockByPartition THEN fails with NotAllowedInMultiPartitionMode', async () => {
                await expect(
                    transferAndLockFacet.transferAndLockByPartition(
                        _NON_DEFAULT_PARTITION,
                        account_A,
                        _AMOUNT,
                        '0x',
                        currentTimestamp
                    )
                )
                    .to.be.revertedWithCustomError(
                        transferAndLockFacet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_NON_DEFAULT_PARTITION)
            })
        })

        describe('transferAndLock', () => {
            it('GIVEN a valid partition WHEN transferAndLockByPartition with enough balance THEN transaction success', async () => {
                await erc1410Facet.issueByPartition(
                    _DEFAULT_PARTITION,
                    account_C,
                    _AMOUNT * 2,
                    '0x'
                )

                await expect(
                    transferAndLockFacet.transferAndLockByPartition(
                        _DEFAULT_PARTITION,
                        account_A,
                        _AMOUNT,
                        '0x',
                        expirationTimestamp
                    )
                )
                    .to.emit(transferAndLockFacet, 'TransferByPartition')
                    .withArgs(
                        _DEFAULT_PARTITION,
                        account_C,
                        account_C,
                        account_A,
                        _AMOUNT,
                        '0x',
                        '0x'
                    )
                    .to.emit(
                        transferAndLockFacet,
                        'PartitionTransferredAndLocked'
                    )
                    .withArgs(
                        _DEFAULT_PARTITION,
                        account_C,
                        account_A,
                        _AMOUNT,
                        '0x',
                        expirationTimestamp,
                        1
                    )
            })

            it('GIVEN a expiration timestamp in past WHEN transferAndLock THEN transaction fails with WrongExpirationTimestamp', async () => {
                await expect(
                    transferAndLockFacet.transferAndLock(
                        account_A,
                        _AMOUNT,
                        '0x',
                        currentTimestamp - ONE_YEAR_IN_SECONDS
                    )
                ).to.be.rejectedWith('WrongExpirationTimestamp')
            })

            it('GIVEN a valid partition WHEN transferAndLock with enough balance THEN transaction success', async () => {
                await erc1410Facet.issueByPartition(
                    _DEFAULT_PARTITION,
                    account_C,
                    _AMOUNT * 2,
                    '0x'
                )

                await expect(
                    transferAndLockFacet.transferAndLock(
                        account_A,
                        _AMOUNT,
                        '0x',
                        expirationTimestamp
                    )
                )
                    .to.emit(transferAndLockFacet, 'TransferByPartition')
                    .withArgs(
                        _DEFAULT_PARTITION,
                        account_C,
                        account_C,
                        account_A,
                        _AMOUNT,
                        '0x',
                        '0x'
                    )
                    .to.emit(
                        transferAndLockFacet,
                        'PartitionTransferredAndLocked'
                    )
                    .withArgs(
                        _DEFAULT_PARTITION,
                        account_C,
                        account_A,
                        _AMOUNT,
                        '0x',
                        expirationTimestamp,
                        1
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

                expect(await lockFacet.getLockedAmountFor(account_C)).to.equal(
                    0
                )
                expect(await lockFacet.getLockCountFor(account_C)).to.equal(0)
                expect(
                    await lockFacet.getLocksIdFor(account_C, 0, 1)
                ).to.deep.equal([])
                expect(await lockFacet.getLockFor(account_C, 1)).to.deep.equal([
                    0, 0,
                ])

                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _DEFAULT_PARTITION,
                        account_C
                    )
                ).to.equal(_AMOUNT)
                expect(
                    await erc1410Facet.balanceOfByPartition(
                        _DEFAULT_PARTITION,
                        account_A
                    )
                ).to.equal(0)
                expect(
                    await erc1410Facet.totalSupplyByPartition(
                        _DEFAULT_PARTITION
                    )
                ).to.equal(_AMOUNT * 2)
            })
        })
    })
})
