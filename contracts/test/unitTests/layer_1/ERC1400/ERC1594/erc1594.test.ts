import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Pause,
    type ERC1594,
    type AccessControl,
    type ControlList,
    type ERC1410Snapshot,
    ERC20,
} from '../../../../../typechain-types'
import { deployEnvironment } from '../../../../../scripts/deployEnvironmentByRpc'
import {
    _CONTROL_LIST_ROLE,
    _DEFAULT_PARTITION,
    _FROM_ACCOUNT_BLOCKED_ERROR_ID,
    _FROM_ACCOUNT_NULL_ERROR_ID,
    _IS_PAUSED_ERROR_ID,
    _ISSUER_ROLE,
    _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID,
    _PAUSER_ROLE,
    _SUCCESS,
    _TO_ACCOUNT_BLOCKED_ERROR_ID,
    _TO_ACCOUNT_NULL_ERROR_ID,
    _ALLOWANCE_REACHED_ERROR_ID,
    _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID,
} from '../../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'

const amount = 1000
const balanceOf_C_Original = 2 * amount
const data = '0x1234'

describe('ERC1594 Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let signer_D: SignerWithAddress
    let signer_E: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string
    let account_D: string
    let account_E: string

    let erc1594Facet: ERC1594
    let accessControlFacet: AccessControl
    let pauseFacet: Pause
    let controlList: ControlList
    describe('Multi partition mode', () => {
        beforeEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-extra-semi
            ;[signer_A, signer_B, signer_C, signer_D, signer_E] =
                await ethers.getSigners()
            account_A = signer_A.address
            account_B = signer_B.address
            account_C = signer_C.address
            account_D = signer_D.address
            account_E = signer_E.address

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
                true,
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

            erc1594Facet = await ethers.getContractAt(
                'ERC1594',
                diamond.address
            )

            pauseFacet = await ethers.getContractAt('Pause', diamond.address)

            controlList = await ethers.getContractAt(
                'ControlList',
                diamond.address
            )

            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_A)
        })

        it('GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized', async () => {
            await expect(erc1594Facet.initialize_ERC1594()).to.be.rejectedWith(
                'AlreadyInitialized'
            )
        })

        describe('Paused', () => {
            beforeEach(async () => {
                // Pausing the token
                pauseFacet = pauseFacet.connect(signer_B)
                await pauseFacet.pause()
            })

            it('GIVEN a paused Token WHEN transfer THEN transaction fails with TokenIsPaused', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // transfer with data fails
                await expect(
                    erc1594Facet.transferWithData(account_D, amount, data)
                ).to.be.rejectedWith('TokenIsPaused')

                // transfer from with data fails
                await expect(
                    erc1594Facet.transferFromWithData(
                        account_E,
                        account_D,
                        amount,
                        data
                    )
                ).to.be.rejectedWith('TokenIsPaused')
            })

            it('GIVEN a paused Token WHEN issue THEN transaction fails with TokenIsPaused', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // issue fails
                await expect(
                    erc1594Facet.issue(account_E, amount, data)
                ).to.be.rejectedWith('TokenIsPaused')
            })

            it('GIVEN a paused Token WHEN redeem THEN transaction fails with TokenIsPaused', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // transfer with data fails
                await expect(
                    erc1594Facet.redeem(amount, data)
                ).to.be.rejectedWith('TokenIsPaused')

                // transfer from with data fails
                await expect(
                    erc1594Facet.redeemFrom(account_E, amount, data)
                ).to.be.rejectedWith('TokenIsPaused')
            })
        })

        describe('ControlList', () => {
            it('GIVEN blocked accounts (sender, to, from) WHEN transfer THEN transaction fails with AccountIsBlocked', async () => {
                // Blacklisting accounts
                accessControlFacet = accessControlFacet.connect(signer_A)
                await accessControlFacet.grantRole(
                    _CONTROL_LIST_ROLE,
                    account_A
                )
                controlList = controlList.connect(signer_A)
                await controlList.addToControlList(account_C)

                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // transfer with data fails
                await expect(
                    erc1594Facet.transferWithData(account_D, amount, data)
                ).to.be.rejectedWith('AccountIsBlocked')

                // transfer from with data fails
                await expect(
                    erc1594Facet.transferFromWithData(
                        account_E,
                        account_D,
                        amount,
                        data
                    )
                ).to.be.rejectedWith('AccountIsBlocked')

                // Update blacklist
                await controlList.removeFromControlList(account_C)
                await controlList.addToControlList(account_D)

                // transfer with data fails
                await expect(
                    erc1594Facet.transferWithData(account_D, amount, data)
                ).to.be.rejectedWith('AccountIsBlocked')

                // transfer from with data fails
                await expect(
                    erc1594Facet.transferFromWithData(
                        account_E,
                        account_D,
                        amount,
                        data
                    )
                ).to.be.rejectedWith('AccountIsBlocked')

                // Update blacklist
                await controlList.removeFromControlList(account_D)
                await controlList.addToControlList(account_E)

                // transfer from with data fails
                await expect(
                    erc1594Facet.transferFromWithData(
                        account_E,
                        account_D,
                        amount,
                        data
                    )
                ).to.be.rejectedWith('AccountIsBlocked')
            })

            it('GIVEN blocked accounts (to) USING WHITELIST WHEN issue THEN transaction fails with AccountIsBlocked', async () => {
                // First deploy a new token using white list
                const isWhiteList = true
                const newDiamond = await deployEquityFromFactory(
                    account_A,
                    isWhiteList,
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
                    []
                )
                accessControlFacet = await ethers.getContractAt(
                    'AccessControl',
                    newDiamond.address
                )

                erc1594Facet = await ethers.getContractAt(
                    'ERC1594',
                    newDiamond.address
                )
                // accounts are blacklisted by default (white list)
                accessControlFacet = accessControlFacet.connect(signer_A)
                await accessControlFacet.grantRole(_ISSUER_ROLE, account_A)

                // Using account A (with role)
                erc1594Facet = erc1594Facet.connect(signer_A)

                // issue fails
                await expect(
                    erc1594Facet.issue(account_E, amount, data)
                ).to.be.rejectedWith('AccountIsBlocked')
            })

            it('GIVEN blocked accounts (sender, from) WHEN redeem THEN transaction fails with AccountIsBlocked', async () => {
                // Blacklisting accounts
                accessControlFacet = accessControlFacet.connect(signer_A)
                await accessControlFacet.grantRole(
                    _CONTROL_LIST_ROLE,
                    account_A
                )
                controlList = controlList.connect(signer_A)
                await controlList.addToControlList(account_C)

                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // redeem with data fails
                await expect(
                    erc1594Facet.redeem(amount, data)
                ).to.be.rejectedWith('AccountIsBlocked')

                // redeem from with data fails
                await expect(
                    erc1594Facet.redeemFrom(account_E, amount, data)
                ).to.be.rejectedWith('AccountIsBlocked')

                // Update blacklist
                await controlList.removeFromControlList(account_C)
                await controlList.addToControlList(account_E)

                // redeem from with data fails
                await expect(
                    erc1594Facet.redeemFrom(account_E, amount, data)
                ).to.be.rejectedWith('AccountIsBlocked')
            })
        })

        describe('AccessControl', () => {
            it('GIVEN an account without issuer role WHEN issue THEN transaction fails with AccountHasNoRole', async () => {
                // Using account C (non role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // add to list fails
                await expect(
                    erc1594Facet.issue(account_E, amount, data)
                ).to.be.rejectedWith('AccountHasNoRole')
            })
        })

        describe('NotAllowedInMultiPartitionMode', () => {
            it('GIVEN an initialized token WHEN transferWithData THEN fails with NotAllowedInMultiPartitionMode', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // transfer with data fails
                await expect(
                    erc1594Facet.transferWithData(
                        account_D,
                        2 * balanceOf_C_Original,
                        data
                    )
                ).to.be.revertedWithCustomError(
                    erc1594Facet,
                    'NotAllowedInMultiPartitionMode'
                )
            })

            it('GIVEN an initialized token WHEN transferFromWithData THEN fails with NotAllowedInMultiPartitionMode', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // transfer with data fails
                await expect(
                    erc1594Facet.transferFromWithData(
                        account_B,
                        account_D,
                        2 * balanceOf_C_Original,
                        data
                    )
                ).to.be.revertedWithCustomError(
                    erc1594Facet,
                    'NotAllowedInMultiPartitionMode'
                )
            })

            it('GIVEN an initialized token WHEN issue THEN fails with NotAllowedInMultiPartitionMode', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_A)

                // transfer with data fails
                expect(await erc1594Facet.isIssuable()).to.be.true
                await expect(
                    erc1594Facet.issue(
                        account_D,
                        2 * balanceOf_C_Original,
                        data
                    )
                ).to.be.revertedWithCustomError(
                    erc1594Facet,
                    'NotAllowedInMultiPartitionMode'
                )
            })

            it('GIVEN an initialized token WHEN redeem THEN fails with NotAllowedInMultiPartitionMode', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // transfer with data fails
                await expect(
                    erc1594Facet.redeem(2 * balanceOf_C_Original, data)
                ).to.be.revertedWithCustomError(
                    erc1594Facet,
                    'NotAllowedInMultiPartitionMode'
                )
            })

            it('GIVEN an initialized token WHEN redeemFrom THEN fails with NotAllowedInMultiPartitionMode', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // transfer with data fails
                await expect(
                    erc1594Facet.redeemFrom(
                        account_D,
                        2 * balanceOf_C_Original,
                        data
                    )
                ).to.be.revertedWithCustomError(
                    erc1594Facet,
                    'NotAllowedInMultiPartitionMode'
                )
            })

            it('GIVEN an initialized token WHEN canTransfer THEN fails with NotAllowedInMultiPartitionMode', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // transfer with data fails
                await expect(
                    erc1594Facet.canTransfer(
                        account_D,
                        2 * balanceOf_C_Original,
                        data
                    )
                ).to.revertedWithCustomError(
                    erc1594Facet,
                    'NotAllowedInMultiPartitionMode'
                )
            })

            it('GIVEN an initialized token WHEN canTransferFrom THEN fails with NotAllowedInMultiPartitionMode', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                // transfer with data fails
                await expect(
                    erc1594Facet.canTransferFrom(
                        account_B,
                        account_D,
                        2 * balanceOf_C_Original,
                        data
                    )
                ).to.revertedWithCustomError(
                    erc1594Facet,
                    'NotAllowedInMultiPartitionMode'
                )
            })
        })
    })

    describe('Single partition mode', () => {
        let erc1594Issuer: ERC1594
        let erc1594Transferor: ERC1594
        let erc1594Approved: ERC1594
        let erc1410SnapshotFacet: ERC1410Snapshot
        let erc20Facet: ERC20
        beforeEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-extra-semi
            ;[signer_A, signer_B, signer_C, signer_D, signer_E] =
                await ethers.getSigners()
            account_A = signer_A.address
            account_B = signer_B.address
            account_C = signer_C.address
            account_D = signer_D.address
            account_E = signer_E.address

            await deployEnvironment()

            const rbacPause: Rbac = {
                role: _PAUSER_ROLE,
                members: [account_B],
            }
            const rbacIssuer: Rbac = {
                role: _ISSUER_ROLE,
                members: [account_C],
            }
            const init_rbacs: Rbac[] = [rbacPause, rbacIssuer]

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
                RegulationType.REG_S,
                RegulationSubType.NONE,
                true,
                'ES,FR,CH',
                'nothing',
                init_rbacs
            )

            accessControlFacet = await ethers.getContractAt(
                'AccessControl',
                diamond.address
            )

            erc1594Facet = await ethers.getContractAt(
                'ERC1594',
                diamond.address
            )
            erc1594Issuer = erc1594Facet.connect(signer_C)
            erc1594Transferor = erc1594Facet.connect(signer_E)
            erc1594Approved = erc1594Facet.connect(signer_D)
            erc20Facet = await ethers.getContractAt(
                'ERC20',
                diamond.address,
                signer_E
            )
            erc1410SnapshotFacet = await ethers.getContractAt(
                'ERC1410Snapshot',
                diamond.address
            )

            pauseFacet = await ethers.getContractAt('Pause', diamond.address)

            controlList = await ethers.getContractAt(
                'ControlList',
                diamond.address
            )

            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_A)
        })

        describe('Paused', () => {
            beforeEach(async () => {
                // Pausing the token
                pauseFacet = pauseFacet.connect(signer_B)
                await pauseFacet.pause()
            })

            it('GIVEN a paused Token WHEN transfer THEN transaction fails with TokenIsPaused', async () => {
                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                expect(
                    await erc1594Facet.canTransfer(account_D, amount, data)
                ).to.be.deep.equal([
                    false,
                    _IS_PAUSED_ERROR_ID,
                    ethers.constants.HashZero,
                ])

                expect(
                    await erc1594Facet.canTransferFrom(
                        account_E,
                        account_D,
                        amount,
                        data
                    )
                ).to.be.deep.equal([
                    false,
                    _IS_PAUSED_ERROR_ID,
                    ethers.constants.HashZero,
                ])
            })
        })

        it(
            'GIVEN blocked accounts (sender, to, from) ' +
                'WHEN canTransfer or canTransferFrom ' +
                'THEN transaction returns _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID, ' +
                '_FROM_ACCOUNT_BLOCKED_ERROR_ID or _TO_ACCOUNT_BLOCKED_ERROR_ID',
            async () => {
                // Blacklisting accounts
                accessControlFacet = accessControlFacet.connect(signer_A)
                await accessControlFacet.grantRole(
                    _CONTROL_LIST_ROLE,
                    account_A
                )
                controlList = controlList.connect(signer_A)
                await controlList.addToControlList(account_C)

                // Using account C (with role)
                erc1594Facet = erc1594Facet.connect(signer_C)

                expect(
                    await erc1594Facet.canTransfer(account_D, amount, data)
                ).to.be.deep.equal([
                    false,
                    _FROM_ACCOUNT_BLOCKED_ERROR_ID,
                    ethers.constants.HashZero,
                ])
                expect(
                    await erc1594Facet
                        .connect(account_D)
                        .canTransfer(account_C, amount, data)
                ).to.be.deep.equal([
                    false,
                    _TO_ACCOUNT_BLOCKED_ERROR_ID,
                    ethers.constants.HashZero,
                ])

                expect(
                    await erc1594Facet.canTransferFrom(
                        account_E,
                        account_D,
                        amount,
                        data
                    )
                ).to.be.deep.equal([
                    false,
                    _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID,
                    ethers.constants.HashZero,
                ])
                erc1594Facet = erc1594Facet.connect(signer_A)
                expect(
                    await erc1594Facet.canTransferFrom(
                        account_C,
                        account_D,
                        amount,
                        data
                    )
                ).to.be.deep.equal([
                    false,
                    _FROM_ACCOUNT_BLOCKED_ERROR_ID,
                    ethers.constants.HashZero,
                ])
                expect(
                    await erc1594Facet.canTransferFrom(
                        account_E,
                        account_C,
                        amount,
                        data
                    )
                ).to.be.deep.equal([
                    false,
                    _TO_ACCOUNT_BLOCKED_ERROR_ID,
                    ethers.constants.HashZero,
                ])
            }
        )

        it('GIVEN a zero address in to WHEN canTransfer and canTransferFrom THEN responds _TO_ACCOUNT_NULL_ERROR_ID', async () => {
            expect(
                await erc1594Facet.canTransfer(
                    ethers.constants.AddressZero,
                    amount,
                    data
                )
            ).to.be.deep.equal([
                false,
                _TO_ACCOUNT_NULL_ERROR_ID,
                ethers.constants.HashZero,
            ])
            expect(
                await erc1594Facet.canTransferFrom(
                    account_D,
                    ethers.constants.AddressZero,
                    amount,
                    data
                )
            ).to.be.deep.equal([
                false,
                _TO_ACCOUNT_NULL_ERROR_ID,
                ethers.constants.HashZero,
            ])
        })

        it('GIVEN a zero address in from WHEN canTransferFrom THEN responds _FROM_ACCOUNT_NULL_ERROR_ID', async () => {
            expect(
                await erc1594Facet.canTransferFrom(
                    ethers.constants.AddressZero,
                    account_D,
                    amount,
                    data
                )
            ).to.be.deep.equal([
                false,
                _FROM_ACCOUNT_NULL_ERROR_ID,
                ethers.constants.HashZero,
            ])
        })

        it('GIVEN a non allowed WHEN canTransferFrom THEN responds _ALLOWANCE_REACHED_ERROR_ID', async () => {
            expect(
                await erc1594Facet.canTransferFrom(
                    account_A,
                    account_D,
                    amount,
                    data
                )
            ).to.be.deep.equal([
                false,
                _ALLOWANCE_REACHED_ERROR_ID,
                ethers.constants.HashZero,
            ])
        })

        it('GIVEN a non funds account WHEN canTransfer & canTransferFrom THEN responds _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID', async () => {
            expect(
                await erc1594Facet.canTransfer(account_D, amount, data)
            ).to.be.deep.equal([
                false,
                _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID,
                ethers.constants.HashZero,
            ])

            await erc20Facet.connect(signer_C).approve(account_A, amount)
            expect(
                await erc1594Facet.canTransferFrom(
                    account_C,
                    account_D,
                    amount,
                    data
                )
            ).to.be.deep.equal([
                false,
                _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID,
                ethers.constants.HashZero,
            ])
        })

        it('GIVEN an account with issuer role WHEN issue THEN transaction succeeds', async () => {
            // issue succeeds
            expect(await erc1594Issuer.issue(account_E, amount / 2, data))
                .to.emit(erc1594Issuer, 'Issued')
                .withArgs(account_C, account_E, amount / 2)
            expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(
                amount / 2
            )
            expect(await erc1410SnapshotFacet.balanceOf(account_E)).to.be.equal(
                amount / 2
            )
            expect(
                await erc1410SnapshotFacet.balanceOfByPartition(
                    _DEFAULT_PARTITION,
                    account_E
                )
            ).to.be.equal(amount / 2)
            expect(
                await erc1410SnapshotFacet.totalSupplyByPartition(
                    _DEFAULT_PARTITION
                )
            ).to.be.equal(amount / 2)
        })

        it('GIVEN an account with balance WHEN transferWithData THEN transaction success', async () => {
            await erc1594Issuer.issue(account_E, amount, data)

            expect(
                await erc1594Transferor.canTransfer(account_D, amount / 2, data)
            ).to.be.deep.equal([true, _SUCCESS, ethers.constants.HashZero])
            expect(
                await erc1594Transferor.transferWithData(
                    account_D,
                    amount / 2,
                    data
                )
            )
                .to.emit(erc1594Transferor, 'Transferred')
                .withArgs(account_E, account_D, amount / 2)

            expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(amount)
            expect(await erc1410SnapshotFacet.balanceOf(account_E)).to.be.equal(
                amount / 2
            )
            expect(await erc1410SnapshotFacet.balanceOf(account_D)).to.be.equal(
                amount / 2
            )
            expect(
                await erc1410SnapshotFacet.balanceOfByPartition(
                    _DEFAULT_PARTITION,
                    account_E
                )
            ).to.be.equal(amount / 2)
            expect(
                await erc1410SnapshotFacet.balanceOfByPartition(
                    _DEFAULT_PARTITION,
                    account_D
                )
            ).to.be.equal(amount / 2)
            expect(
                await erc1410SnapshotFacet.totalSupplyByPartition(
                    _DEFAULT_PARTITION
                )
            ).to.be.equal(amount)
        })

        it(
            'GIVEN an account with balance and another with allowance ' +
                'WHEN transferFromWithData ' +
                'THEN transaction success',
            async () => {
                await erc1594Issuer.issue(account_E, amount, data)
                await erc20Facet.approve(account_D, amount / 2)

                expect(
                    await erc1594Approved.canTransferFrom(
                        account_E,
                        account_D,
                        amount / 2,
                        data
                    )
                ).to.be.deep.equal([true, _SUCCESS, ethers.constants.HashZero])
                expect(
                    await erc1594Approved.transferFromWithData(
                        account_E,
                        account_D,
                        amount / 2,
                        data
                    )
                )
                    .to.emit(erc1594Transferor, 'Transferred')
                    .withArgs(account_E, account_D, amount / 2)

                expect(
                    await erc20Facet.allowance(account_E, account_D)
                ).to.be.equal(0)
                expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(
                    amount
                )
                expect(
                    await erc1410SnapshotFacet.balanceOf(account_E)
                ).to.be.equal(amount / 2)
                expect(
                    await erc1410SnapshotFacet.balanceOf(account_D)
                ).to.be.equal(amount / 2)
                expect(
                    await erc1410SnapshotFacet.balanceOfByPartition(
                        _DEFAULT_PARTITION,
                        account_E
                    )
                ).to.be.equal(amount / 2)
                expect(
                    await erc1410SnapshotFacet.balanceOfByPartition(
                        _DEFAULT_PARTITION,
                        account_D
                    )
                ).to.be.equal(amount / 2)
                expect(
                    await erc1410SnapshotFacet.totalSupplyByPartition(
                        _DEFAULT_PARTITION
                    )
                ).to.be.equal(amount)
            }
        )

        it('GIVEN an account with balance WHEN redeem THEN transaction succeeds', async () => {
            // issue succeeds
            await erc1594Issuer.issue(account_E, amount, data)

            expect(await erc1594Transferor.redeem(amount / 2, data))
                .to.emit(erc1594Issuer, 'Redeemed')
                .withArgs(account_E, account_E, amount / 2)
            expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(
                amount / 2
            )
            expect(await erc1410SnapshotFacet.balanceOf(account_E)).to.be.equal(
                amount / 2
            )
            expect(
                await erc1410SnapshotFacet.balanceOfByPartition(
                    _DEFAULT_PARTITION,
                    account_E
                )
            ).to.be.equal(amount / 2)
            expect(
                await erc1410SnapshotFacet.totalSupplyByPartition(
                    _DEFAULT_PARTITION
                )
            ).to.be.equal(amount / 2)
        })

        it(
            'GIVEN an account with balance and another with allowance ' +
                'WHEN redeemFrom ' +
                'THEN transaction succeeds',
            async () => {
                // issue succeeds
                await erc1594Issuer.issue(account_E, amount, data)

                await erc20Facet.approve(account_D, amount / 2)
                expect(
                    await erc1594Approved.redeemFrom(
                        account_E,
                        amount / 2,
                        data
                    )
                )
                    .to.emit(erc1594Issuer, 'Redeemed')
                    .withArgs(account_D, account_E, amount / 2)

                expect(
                    await erc20Facet.allowance(account_E, account_D)
                ).to.be.equal(0)
                expect(await erc1410SnapshotFacet.totalSupply()).to.be.equal(
                    amount / 2
                )
                expect(
                    await erc1410SnapshotFacet.balanceOf(account_E)
                ).to.be.equal(amount / 2)
                expect(
                    await erc1410SnapshotFacet.balanceOfByPartition(
                        _DEFAULT_PARTITION,
                        account_E
                    )
                ).to.be.equal(amount / 2)
                expect(
                    await erc1410SnapshotFacet.totalSupplyByPartition(
                        _DEFAULT_PARTITION
                    )
                ).to.be.equal(amount / 2)
            }
        )
    })
})
