import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Pause,
    type ERC1410ScheduledSnapshot,
    type AccessControl,
    type Equity,
    type ControlList,
    type Cap,
} from '../../../../../typechain-types'
import { deployEnvironment } from '../../../../../scripts/deployEnvironmentByRpc'
import {
    _CAP_ROLE,
    _CONTROLLER_ROLE,
    _CONTROL_LIST_ROLE,
    _CORPORATE_ACTION_ROLE,
    _FROM_ACCOUNT_BLOCKED_ERROR_ID,
    _FROM_ACCOUNT_NULL_ERROR_ID,
    _ISSUER_ROLE,
    _IS_NOT_OPERATOR_ERROR_ID,
    _IS_PAUSED_ERROR_ID,
    _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID,
    _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID,
    _PAUSER_ROLE,
    _TO_ACCOUNT_BLOCKED_ERROR_ID,
    _WRONG_PARTITION_ERROR_ID,
} from '../../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { ADDRESS_0 } from '../../../../../scripts/constants'
import { grantRoleAndPauseToken } from '../../../../../scripts/testCommon'

const amount = 1
const balanceOf_C_Original = 2 * amount
const balanceOf_E_Original = 2 * amount
const snapshot_1_delay = 8000
const snapshot_2_delay = snapshot_1_delay * 3
const data = '0x1234'
const operatorData = '0x5678'
const _PARTITION_ID_1 =
    '0x0000000000000000000000000000000000000000000000000000000000000001'
const _PARTITION_ID_2 =
    '0x0000000000000000000000000000000000000000000000000000000000000002'

describe('ERC1410 Tests', () => {
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

    let erc1410Facet: ERC1410ScheduledSnapshot
    let accessControlFacet: AccessControl
    let pauseFacet: Pause
    let equityFacet: Equity
    let controlList: ControlList
    let capFacet: Cap

    describe('Multi partition ', () => {
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

            erc1410Facet = await ethers.getContractAt(
                'ERC1410ScheduledSnapshot',
                diamond.address
            )

            equityFacet = await ethers.getContractAt('Equity', diamond.address)

            pauseFacet = await ethers.getContractAt('Pause', diamond.address)

            controlList = await ethers.getContractAt(
                'ControlList',
                diamond.address
            )

            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_A)
            erc1410Facet = erc1410Facet.connect(signer_A)

            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_C,
                balanceOf_C_Original,
                '0x'
            )
            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_E,
                balanceOf_E_Original,
                '0x'
            )
        })

        it('GIVEN an account WHEN authorizing and revoking operators THEN transaction succeeds', async () => {
            await erc1410Facet.issueByPartition(
                _PARTITION_ID_2,
                account_C,
                balanceOf_C_Original,
                '0x'
            )
            // authorize
            erc1410Facet = erc1410Facet.connect(signer_C)
            await erc1410Facet.authorizeOperator(account_D)
            await erc1410Facet.authorizeOperatorByPartition(
                _PARTITION_ID_2,
                account_E
            )

            // check
            let isOperator_D = await erc1410Facet.isOperator(
                account_D,
                account_C
            )
            const isOperator_E = await erc1410Facet.isOperator(
                account_E,
                account_C
            )
            const isOperatorByPartition_E_1 =
                await erc1410Facet.isOperatorForPartition(
                    _PARTITION_ID_1,
                    account_E,
                    account_C
                )
            let isOperatorByPartition_E_2 =
                await erc1410Facet.isOperatorForPartition(
                    _PARTITION_ID_2,
                    account_E,
                    account_C
                )
            expect(isOperator_D).to.be.equal(true)
            expect(isOperator_E).to.be.equal(false)
            expect(isOperatorByPartition_E_1).to.be.equal(false)
            expect(isOperatorByPartition_E_2).to.be.equal(true)

            erc1410Facet = erc1410Facet.connect(signer_D)
            await erc1410Facet.operatorRedeemByPartition(
                _PARTITION_ID_1,
                account_C,
                balanceOf_C_Original,
                '0x',
                '0x'
            )
            erc1410Facet = erc1410Facet.connect(signer_E)
            await erc1410Facet.operatorRedeemByPartition(
                _PARTITION_ID_2,
                account_C,
                balanceOf_C_Original,
                '0x',
                '0x'
            )

            // revoke
            erc1410Facet = erc1410Facet.connect(signer_C)
            await erc1410Facet.revokeOperator(account_D)
            await erc1410Facet.revokeOperatorByPartition(
                _PARTITION_ID_2,
                account_E
            )

            // check
            isOperator_D = await erc1410Facet.isOperator(account_D, account_C)
            isOperatorByPartition_E_2 =
                await erc1410Facet.isOperatorForPartition(
                    _PARTITION_ID_2,
                    account_E,
                    account_C
                )
            expect(isOperator_D).to.be.equal(false)
            expect(isOperatorByPartition_E_2).to.be.equal(false)
        })

        it('GIVEN a paused Token WHEN transfer THEN transaction fails with TokenIsPaused', async () => {
            // Pausing the token
            pauseFacet = pauseFacet.connect(signer_B)
            await pauseFacet.pause()

            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            const canTransfer = await erc1410Facet.canTransferByPartition(
                account_C,
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            const canTransfer_2 = await erc1410Facet.canTransferByPartition(
                account_E,
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )

            // transfer with data fails
            await expect(
                erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data
                )
            ).to.be.rejectedWith('TokenIsPaused')
            expect(canTransfer[0]).to.be.equal(false)
            expect(canTransfer[1]).to.be.equal(_IS_PAUSED_ERROR_ID)

            // transfer from with data fails
            await expect(
                erc1410Facet.operatorTransferByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            ).to.be.rejectedWith('TokenIsPaused')
            expect(canTransfer_2[0]).to.be.equal(false)
            expect(canTransfer_2[1]).to.be.equal(_IS_PAUSED_ERROR_ID)
        })

        it('GIVEN a paused Token WHEN issue THEN transaction fails with TokenIsPaused', async () => {
            // Pausing the token
            pauseFacet = pauseFacet.connect(signer_B)
            await pauseFacet.pause()

            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)

            // issue fails
            await expect(
                erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    amount,
                    data
                )
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN Token WHEN issue to partition 0 THEN transaction fails with ZeroPartition', async () => {
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_A)

            // issue fails
            await expect(
                erc1410Facet.issueByPartition(
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    account_E,
                    amount,
                    data
                )
            ).to.be.rejectedWith('ZeroPartition')
        })

        it('GIVEN Token WHEN issue amount 0 THEN transaction fails with ZeroValue', async () => {
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_A)

            // issue fails
            await expect(
                erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    0,
                    data
                )
            ).to.be.rejectedWith('ZeroValue')
        })

        it('GIVEN a paused Token WHEN redeem THEN transaction fails with TokenIsPaused', async () => {
            // Pausing the token
            pauseFacet = pauseFacet.connect(signer_B)
            await pauseFacet.pause()

            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            const canRedeem = await erc1410Facet.canRedeemByPartition(
                account_C,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            const canRedeem_2 = await erc1410Facet.canRedeemByPartition(
                account_E,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )

            // transfer with data fails
            await expect(
                erc1410Facet.redeemByPartition(_PARTITION_ID_1, amount, data)
            ).to.be.rejectedWith('TokenIsPaused')
            expect(canRedeem[0]).to.be.equal(false)
            expect(canRedeem[1]).to.be.equal(_IS_PAUSED_ERROR_ID)

            // transfer from with data fails
            await expect(
                erc1410Facet.operatorRedeemByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            ).to.be.rejectedWith('TokenIsPaused')
            expect(canRedeem_2[0]).to.be.equal(false)
            expect(canRedeem_2[1]).to.be.equal(_IS_PAUSED_ERROR_ID)
        })

        it('GIVEN blocked accounts (sender, to, from) WHEN transfer THEN transaction fails with AccountIsBlocked', async () => {
            // Blacklisting accounts
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_CONTROL_LIST_ROLE, account_A)
            controlList = controlList.connect(signer_A)
            await controlList.addToControlList(account_C)

            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            let canTransfer = await erc1410Facet.canTransferByPartition(
                account_C,
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            let canTransfer_2 = await erc1410Facet.canTransferByPartition(
                account_E,
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )

            // transfer with data fails
            await expect(
                erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            expect(canTransfer[0]).to.be.equal(false)
            expect(canTransfer[1]).to.be.equal(
                _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID
            )

            // transfer from with data fails
            await expect(
                erc1410Facet.operatorTransferByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            expect(canTransfer_2[0]).to.be.equal(false)
            expect(canTransfer_2[1]).to.be.equal(
                _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID
            )

            // Update blacklist
            await controlList.removeFromControlList(account_C)
            await controlList.addToControlList(account_D)
            canTransfer = await erc1410Facet.canTransferByPartition(
                account_C,
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            canTransfer_2 = await erc1410Facet.canTransferByPartition(
                account_E,
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )

            // transfer with data fails
            await expect(
                erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            expect(canTransfer[0]).to.be.equal(false)
            expect(canTransfer[1]).to.be.equal(_TO_ACCOUNT_BLOCKED_ERROR_ID)

            // transfer from with data fails
            await expect(
                erc1410Facet.operatorTransferByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            expect(canTransfer_2[0]).to.be.equal(false)
            expect(canTransfer_2[1]).to.be.equal(_TO_ACCOUNT_BLOCKED_ERROR_ID)

            // Update blacklist
            await controlList.removeFromControlList(account_D)
            await controlList.addToControlList(account_E)
            canTransfer_2 = await erc1410Facet.canTransferByPartition(
                account_E,
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )

            // transfer from with data fails
            await expect(
                erc1410Facet.operatorTransferByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            expect(canTransfer_2[0]).to.be.equal(false)
            expect(canTransfer_2[1]).to.be.equal(_FROM_ACCOUNT_BLOCKED_ERROR_ID)
        })

        it('GIVEN blocked accounts (to) USING WHITELIST WHEN issue THEN transaction fails with AccountIsBlocked', async () => {
            // First deploy a new token using white list
            const isWhiteList = true
            const newDiamond = await deployEquityFromFactory(
                account_A,
                isWhiteList,
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
                []
            )
            accessControlFacet = await ethers.getContractAt(
                'AccessControl',
                newDiamond.address
            )

            erc1410Facet = await ethers.getContractAt(
                'ERC1410ScheduledSnapshot',
                newDiamond.address
            )

            // accounts are blacklisted by default (white list)
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_A)

            // Using account A (with role)
            erc1410Facet = erc1410Facet.connect(signer_A)

            // issue fails
            await expect(
                erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    amount,
                    data
                )
            ).to.be.rejectedWith('AccountIsBlocked')
        })

        it('GIVEN blocked accounts (sender, from) WHEN redeem THEN transaction fails with AccountIsBlocked', async () => {
            // Blacklisting accounts
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_CONTROL_LIST_ROLE, account_A)
            controlList = controlList.connect(signer_A)
            await controlList.addToControlList(account_C)

            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            const canRedeem = await erc1410Facet.canRedeemByPartition(
                account_C,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            let canRedeem_2 = await erc1410Facet.canRedeemByPartition(
                account_E,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )

            // redeem with data fails
            await expect(
                erc1410Facet.redeemByPartition(_PARTITION_ID_1, amount, data)
            ).to.be.rejectedWith('AccountIsBlocked')
            expect(canRedeem[0]).to.be.equal(false)
            expect(canRedeem[1]).to.be.equal(_OPERATOR_ACCOUNT_BLOCKED_ERROR_ID)

            // redeem from with data fails
            await expect(
                erc1410Facet.operatorRedeemByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            expect(canRedeem_2[0]).to.be.equal(false)
            expect(canRedeem_2[1]).to.be.equal(
                _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID
            )

            // Update blacklist
            await controlList.removeFromControlList(account_C)
            await controlList.addToControlList(account_E)
            canRedeem_2 = await erc1410Facet.canRedeemByPartition(
                account_E,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )

            // redeem from with data fails
            await expect(
                erc1410Facet.operatorRedeemByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            expect(canRedeem_2[0]).to.be.equal(false)
            expect(canRedeem_2[1]).to.be.equal(_FROM_ACCOUNT_BLOCKED_ERROR_ID)
        })

        it('GIVEN wrong partition WHEN transfer THEN transaction fails with InValidPartition', async () => {
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            const canTransfer = await erc1410Facet.canTransferByPartition(
                account_C,
                account_D,
                _PARTITION_ID_2,
                amount,
                data,
                operatorData
            )

            // transfer with data fails
            await expect(
                erc1410Facet.transferByPartition(
                    _PARTITION_ID_2,
                    account_D,
                    amount,
                    data
                )
            ).to.be.rejectedWith('InvalidPartition')
            expect(canTransfer[0]).to.be.equal(false)
            expect(canTransfer[1]).to.be.equal(_WRONG_PARTITION_ERROR_ID)
        })

        it('GIVEN wrong partition WHEN redeem THEN transaction fails with InValidPartition', async () => {
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            const canRedeem = await erc1410Facet.canRedeemByPartition(
                account_C,
                _PARTITION_ID_2,
                amount,
                data,
                operatorData
            )

            // transfer with data fails
            await expect(
                erc1410Facet.redeemByPartition(_PARTITION_ID_2, amount, data)
            ).to.be.rejectedWith('InvalidPartition')
            expect(canRedeem[0]).to.be.equal(false)
            expect(canRedeem[1]).to.be.equal(_WRONG_PARTITION_ERROR_ID)
        })

        it('GIVEN an account without issuer role WHEN issue THEN transaction fails with AccountHasNoRole', async () => {
            // Using account C (non role)
            erc1410Facet = erc1410Facet.connect(signer_C)

            // add to list fails
            await expect(
                erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    amount,
                    data
                )
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN an account WHEN transfer more than its balance THEN transaction fails', async () => {
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)

            // transfer with data fails
            const canTransfer = await erc1410Facet.canTransferByPartition(
                account_C,
                account_D,
                _PARTITION_ID_1,
                2 * balanceOf_C_Original,
                data,
                operatorData
            )
            await expect(
                erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    2 * balanceOf_C_Original,
                    data
                )
            ).to.be.rejected
            expect(canTransfer[0]).to.be.equal(false)
            expect(canTransfer[1]).to.be.equal(
                _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID
            )

            // transfer from with data fails
            erc1410Facet = erc1410Facet.connect(signer_E)
            await erc1410Facet.authorizeOperator(account_C)
            erc1410Facet = erc1410Facet.connect(signer_C)
            const canTransfer_2 = await erc1410Facet.canTransferByPartition(
                account_E,
                account_D,
                _PARTITION_ID_1,
                2 * balanceOf_E_Original,
                data,
                operatorData
            )
            await expect(
                erc1410Facet.operatorTransferByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    account_D,
                    2 * balanceOf_E_Original,
                    data,
                    operatorData
                )
            ).to.be.rejected
            expect(canTransfer_2[0]).to.be.equal(false)
            expect(canTransfer_2[1]).to.be.equal(
                _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID
            )
        })

        it('GIVEN an account WHEN redeem more than its balance THEN transaction fails', async () => {
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)

            // transfer with data fails
            const canRedeem = await erc1410Facet.canRedeemByPartition(
                account_C,
                _PARTITION_ID_1,
                2 * balanceOf_C_Original,
                data,
                operatorData
            )

            await expect(
                erc1410Facet.redeemByPartition(
                    _PARTITION_ID_1,
                    2 * balanceOf_C_Original,
                    data
                )
            ).to.be.rejected
            expect(canRedeem[0]).to.be.equal(false)
            expect(canRedeem[1]).to.be.equal(
                _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID
            )

            // transfer from with data fails
            const canRedeem_2 = await erc1410Facet.canRedeemByPartition(
                account_E,
                _PARTITION_ID_1,
                2 * balanceOf_C_Original,
                data,
                operatorData
            )
            await erc1410Facet.authorizeOperatorByPartition(
                _PARTITION_ID_1,
                account_E
            )
            erc1410Facet = erc1410Facet.connect(signer_E)
            await expect(
                erc1410Facet.operatorRedeemByPartition(
                    _PARTITION_ID_1,
                    account_C,
                    2 * balanceOf_C_Original,
                    data,
                    operatorData
                )
            ).to.be.rejected
            expect(canRedeem_2[0]).to.be.equal(false)
            expect(canRedeem_2[1]).to.be.equal(
                _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID
            )
        })

        it('GIVEN an account WHEN transfer from address 0 THEN transaction fails', async () => {
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)

            const canTransfer = await erc1410Facet.canTransferByPartition(
                ADDRESS_0,
                account_D,
                _PARTITION_ID_1,
                balanceOf_E_Original,
                data,
                operatorData
            )
            await expect(
                erc1410Facet.operatorTransferByPartition(
                    _PARTITION_ID_1,
                    ADDRESS_0,
                    account_D,
                    balanceOf_E_Original,
                    data,
                    operatorData
                )
            ).to.be.rejected
            await expect(
                erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    ADDRESS_0,
                    balanceOf_C_Original,
                    data
                )
            ).to.be.rejected
            expect(canTransfer[0]).to.be.equal(false)
            expect(canTransfer[1]).to.be.equal(_FROM_ACCOUNT_NULL_ERROR_ID)
        })

        it('GIVEN an account WHEN redeem from address 0 THEN transaction fails', async () => {
            // transfer from with data fails
            erc1410Facet = erc1410Facet.connect(signer_E)
            const canRedeem = await erc1410Facet.canRedeemByPartition(
                ADDRESS_0,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            await erc1410Facet.authorizeOperator(account_C)
            await expect(
                erc1410Facet.operatorRedeemByPartition(
                    _PARTITION_ID_1,
                    ADDRESS_0,
                    balanceOf_E_Original,
                    data,
                    operatorData
                )
            ).to.be.rejected
            expect(canRedeem[0]).to.be.equal(false)
            expect(canRedeem[1]).to.be.equal(_FROM_ACCOUNT_NULL_ERROR_ID)
        })

        it('GIVEN an account WHEN transfer THEN transaction succeeds', async () => {
            // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            // Granting Role to account C
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            equityFacet = equityFacet.connect(signer_C)
            // scheduling 2 snapshots
            const currentTimeInSeconds = (
                await ethers.provider.getBlock('latest')
            ).timestamp
            const dividendsRecordDateInSeconds_1 =
                currentTimeInSeconds + snapshot_1_delay / 1000
            const dividendsRecordDateInSeconds_2 =
                currentTimeInSeconds + snapshot_2_delay / 1000
            const dividendsExecutionDateInSeconds =
                currentTimeInSeconds + 10 * (snapshot_2_delay / 1000)
            const dividendData_1 = {
                recordDate: dividendsRecordDateInSeconds_1.toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: 1,
            }
            const dividendData_2 = {
                recordDate: dividendsRecordDateInSeconds_2.toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: 1,
            }
            await equityFacet.setDividends(dividendData_1)
            await equityFacet.setDividends(dividendData_2)

            //  transfer
            const canTransfer = await erc1410Facet.canTransferByPartition(
                account_C,
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            await expect(
                erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data
                )
            )
                .to.emit(erc1410Facet, 'TransferByPartition')
                .withArgs(
                    _PARTITION_ID_1,
                    ADDRESS_0,
                    account_C,
                    account_D,
                    amount,
                    data,
                    '0x'
                )
            expect(canTransfer[0]).to.be.equal(true)
            // transfer from
            erc1410Facet = erc1410Facet.connect(signer_E)
            await erc1410Facet.authorizeOperator(account_C)
            const canTransfer_2 = await erc1410Facet.canTransferByPartition(
                account_E,
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            erc1410Facet = erc1410Facet.connect(signer_C)
            await expect(
                erc1410Facet.operatorTransferByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            )
                .to.emit(erc1410Facet, 'TransferByPartition')
                .withArgs(
                    _PARTITION_ID_1,
                    account_C,
                    account_E,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            expect(canTransfer_2[0]).to.be.equal(true)

            // check amounts
            const balanceOf_C = await erc1410Facet.balanceOf(account_C)
            expect(balanceOf_C).to.equal(balanceOf_C_Original - amount)
            const balanceOf_E = await erc1410Facet.balanceOf(account_E)
            expect(balanceOf_E).to.equal(balanceOf_E_Original - amount)
            const balanceOf_D = await erc1410Facet.balanceOf(account_D)
            expect(balanceOf_D).to.equal(2 * amount)
            let dividend_1 = await equityFacet.getDividends(1)
            let dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(0)
            expect(dividend_2.snapshotId.toNumber()).to.equal(0)
            let dividend_1_For_C = await equityFacet.getDividendsFor(
                1,
                account_C
            )
            let dividend_1_For_E = await equityFacet.getDividendsFor(
                1,
                account_E
            )
            let dividend_1_For_D = await equityFacet.getDividendsFor(
                1,
                account_D
            )
            expect(dividend_1_For_C.tokenBalance).to.equal(0)
            expect(dividend_1_For_E.tokenBalance).to.equal(0)
            expect(dividend_1_For_D.tokenBalance).to.equal(0)
            expect(dividend_1_For_C.recordDateReached).to.equal(false)
            expect(dividend_1_For_E.recordDateReached).to.equal(false)
            expect(dividend_1_For_D.recordDateReached).to.equal(false)
            // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            await new Promise((f) => setTimeout(f, snapshot_1_delay))

            // dumb transactions just to create a new block with a new blocktimestamp without trigerring the snapshot
            await accessControlFacet.revokeRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // dumb transactions just to create a new block with a new blocktimestamp without trigerring the snapshot
            dividend_1 = await equityFacet.getDividends(1)
            expect(dividend_1.snapshotId.toNumber()).to.equal(0)

            dividend_1_For_C = await equityFacet.getDividendsFor(1, account_C)
            dividend_1_For_E = await equityFacet.getDividendsFor(1, account_E)
            dividend_1_For_D = await equityFacet.getDividendsFor(1, account_D)

            expect(dividend_1_For_C.tokenBalance.toNumber()).to.equal(
                balanceOf_C.toNumber()
            )
            expect(dividend_1_For_E.tokenBalance.toNumber()).to.equal(
                balanceOf_E.toNumber()
            )
            expect(dividend_1_For_D.tokenBalance.toNumber()).to.equal(
                balanceOf_D.toNumber()
            )
            expect(dividend_1_For_C.recordDateReached).to.equal(true)
            expect(dividend_1_For_E.recordDateReached).to.equal(true)
            expect(dividend_1_For_D.recordDateReached).to.equal(true)

            // transfer
            await expect(
                erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data
                )
            )
                .to.emit(erc1410Facet, 'SnapshotTriggered')
                .withArgs(account_C, 1)
            // check that scheduled snapshots was triggered
            dividend_1 = await equityFacet.getDividends(1)
            dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(1)
            expect(dividend_2.snapshotId.toNumber()).to.equal(0)
            dividend_1_For_C = await equityFacet.getDividendsFor(1, account_C)
            dividend_1_For_E = await equityFacet.getDividendsFor(1, account_E)
            dividend_1_For_D = await equityFacet.getDividendsFor(1, account_D)

            expect(dividend_1_For_C.tokenBalance.toNumber()).to.equal(
                balanceOf_C.toNumber()
            )
            expect(dividend_1_For_E.tokenBalance.toNumber()).to.equal(
                balanceOf_E.toNumber()
            )
            expect(dividend_1_For_D.tokenBalance.toNumber()).to.equal(
                balanceOf_D.toNumber()
            )
            expect(dividend_1_For_C.recordDateReached).to.equal(true)
            expect(dividend_1_For_E.recordDateReached).to.equal(true)
            expect(dividend_1_For_D.recordDateReached).to.equal(true)

            // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            await new Promise((f) =>
                setTimeout(f, snapshot_2_delay - snapshot_1_delay)
            )

            // transfer From
            await expect(
                erc1410Facet.operatorTransferByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            )
                .to.emit(erc1410Facet, 'SnapshotTriggered')
                .withArgs(account_C, 2)

            // check that scheduled snapshots was triggered
            dividend_1 = await equityFacet.getDividends(1)
            dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(1)
            expect(dividend_2.snapshotId.toNumber()).to.equal(2)
        })

        it('GIVEN an account WHEN issue more than max supply THEN transaction fails with MaxSupplyReached or MaxSupplyReachedForPartition', async () => {
            // Using account C (non role)
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_CAP_ROLE, account_A)
            erc1410Facet = erc1410Facet.connect(signer_A)
            capFacet = await ethers.getContractAt('Cap', diamond.address)
            capFacet = capFacet.connect(signer_A)
            await capFacet.setMaxSupply(
                balanceOf_C_Original + balanceOf_E_Original + 2 * amount
            )
            await capFacet.setMaxSupplyByPartition(
                _PARTITION_ID_1,
                balanceOf_C_Original + balanceOf_E_Original + amount
            )

            // add to list fails
            await expect(
                erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    3 * amount,
                    data
                )
            ).to.be.rejectedWith('MaxSupplyReached')

            await expect(
                erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    2 * amount,
                    data
                )
            ).to.be.rejectedWith('MaxSupplyReachedForPartition')
        })

        it('GIVEN an account WHEN issue THEN transaction succeeds', async () => {
            // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            // Granting Role to account C
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_A)
            equityFacet = equityFacet.connect(signer_C)
            // scheduling 2 snapshots
            const currentTimeInSeconds = (
                await ethers.provider.getBlock('latest')
            ).timestamp
            const dividendsRecordDateInSeconds_1 =
                currentTimeInSeconds + snapshot_1_delay / 1000
            const dividendsRecordDateInSeconds_2 =
                currentTimeInSeconds + snapshot_2_delay / 1000
            const dividendsExecutionDateInSeconds =
                currentTimeInSeconds + 10 * (snapshot_2_delay / 1000)
            const dividendData_1 = {
                recordDate: dividendsRecordDateInSeconds_1.toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: 1,
            }
            const dividendData_2 = {
                recordDate: dividendsRecordDateInSeconds_2.toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: 1,
            }
            await equityFacet.setDividends(dividendData_1)
            await equityFacet.setDividends(dividendData_2)

            //  transfer
            await expect(
                erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data
                )
            )
                .to.emit(erc1410Facet, 'IssuedByPartition')
                .withArgs(_PARTITION_ID_1, account_A, account_D, amount, data)

            // check amounts
            const balanceOf_D = await erc1410Facet.balanceOf(account_D)
            const balanceOf_D_Partition_1 =
                await erc1410Facet.balanceOfByPartition(
                    _PARTITION_ID_1,
                    account_D
                )
            const partitionsOf_D = await erc1410Facet.partitionsOf(account_D)
            expect(partitionsOf_D.length).to.equal(1)
            expect(partitionsOf_D[0]).to.equal(_PARTITION_ID_1)
            expect(balanceOf_D).to.equal(amount)
            expect(balanceOf_D_Partition_1).to.equal(balanceOf_D)
            const totalSupply = await erc1410Facet.totalSupply()
            const totalSupplyByPartition =
                await erc1410Facet.totalSupplyByPartition(_PARTITION_ID_1)
            expect(totalSupply).to.equal(
                balanceOf_C_Original +
                    balanceOf_E_Original +
                    balanceOf_D.toNumber()
            )
            expect(totalSupplyByPartition.toString()).to.equal(
                totalSupply.toString()
            )
            let dividend_1 = await equityFacet.getDividends(1)
            let dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(0)
            expect(dividend_2.snapshotId.toNumber()).to.equal(0)

            // Set Max supplies to test
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_CAP_ROLE, account_A)
            capFacet = await ethers.getContractAt('Cap', diamond.address)
            capFacet = capFacet.connect(signer_A)
            await capFacet.setMaxSupply(
                balanceOf_C_Original + balanceOf_E_Original + 100 * amount
            )
            await capFacet.setMaxSupplyByPartition(
                _PARTITION_ID_1,
                balanceOf_C_Original + balanceOf_E_Original + 100 * amount
            )

            // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            await new Promise((f) => setTimeout(f, snapshot_1_delay))

            // transfer
            await expect(
                erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data
                )
            )
                .to.emit(erc1410Facet, 'SnapshotTriggered')
                .withArgs(account_A, 1)

            // check that scheduled snapshots was triggered
            dividend_1 = await equityFacet.getDividends(1)
            dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(1)
            expect(dividend_2.snapshotId.toNumber()).to.equal(0)
        })

        it('GIVEN an account WHEN redeem THEN transaction succeeds', async () => {
            // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            // Granting Role to account C
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            equityFacet = equityFacet.connect(signer_C)
            // scheduling 2 snapshots
            const currentTimeInSeconds = (
                await ethers.provider.getBlock('latest')
            ).timestamp
            const dividendsRecordDateInSeconds_1 =
                currentTimeInSeconds + snapshot_1_delay / 1000
            const dividendsRecordDateInSeconds_2 =
                currentTimeInSeconds + snapshot_2_delay / 1000
            const dividendsExecutionDateInSeconds =
                currentTimeInSeconds + 10 * (snapshot_2_delay / 1000)
            const dividendData_1 = {
                recordDate: dividendsRecordDateInSeconds_1.toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: 1,
            }
            const dividendData_2 = {
                recordDate: dividendsRecordDateInSeconds_2.toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: 1,
            }
            await equityFacet.setDividends(dividendData_1)
            await equityFacet.setDividends(dividendData_2)

            //  transfer
            const canRedeem = await erc1410Facet.canRedeemByPartition(
                account_C,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            expect(canRedeem[0]).to.be.equal(true)
            await expect(
                erc1410Facet.redeemByPartition(_PARTITION_ID_1, amount, data)
            )
                .to.emit(erc1410Facet, 'RedeemedByPartition')
                .withArgs(
                    _PARTITION_ID_1,
                    ADDRESS_0,
                    account_C,
                    amount,
                    data,
                    '0x'
                )
            let totalSupply = await erc1410Facet.totalSupply()
            let totalSupplyByPartition =
                await erc1410Facet.totalSupplyByPartition(_PARTITION_ID_1)
            // transfer from
            erc1410Facet = erc1410Facet.connect(signer_E)
            await erc1410Facet.authorizeOperator(account_C)
            erc1410Facet = erc1410Facet.connect(signer_C)
            const canRedeem_2 = await erc1410Facet.canRedeemByPartition(
                account_E,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )
            expect(canRedeem_2[0]).to.be.equal(true)
            expect(totalSupply).to.be.equal(
                balanceOf_C_Original + balanceOf_E_Original - amount
            )
            expect(totalSupplyByPartition).to.be.equal(totalSupply)
            await expect(
                erc1410Facet.operatorRedeemByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            )
                .to.emit(erc1410Facet, 'RedeemedByPartition')
                .withArgs(
                    _PARTITION_ID_1,
                    account_C,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            totalSupply = await erc1410Facet.totalSupply()
            totalSupplyByPartition = await erc1410Facet.totalSupplyByPartition(
                _PARTITION_ID_1
            )

            // check amounts
            const balanceOf_C = await erc1410Facet.balanceOf(account_C)
            const balanceOf_C_Partition_1 =
                await erc1410Facet.balanceOfByPartition(
                    _PARTITION_ID_1,
                    account_C
                )
            const partitionsOf_C = await erc1410Facet.partitionsOf(account_C)
            expect(partitionsOf_C.length).to.equal(1)
            expect(partitionsOf_C[0]).to.equal(_PARTITION_ID_1)
            expect(balanceOf_C).to.equal(balanceOf_C_Original - amount)
            expect(balanceOf_C_Partition_1).to.equal(balanceOf_C)
            const balanceOf_E = await erc1410Facet.balanceOf(account_E)
            const balanceOf_E_Partition_1 =
                await erc1410Facet.balanceOfByPartition(
                    _PARTITION_ID_1,
                    account_E
                )
            const partitionsOf_E = await erc1410Facet.partitionsOf(account_E)
            expect(partitionsOf_E.length).to.equal(1)
            expect(partitionsOf_E[0]).to.equal(_PARTITION_ID_1)
            expect(balanceOf_E).to.equal(balanceOf_E_Original - amount)
            expect(balanceOf_E_Partition_1).to.equal(balanceOf_E)
            let dividend_1 = await equityFacet.getDividends(1)
            let dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(0)
            expect(dividend_2.snapshotId.toNumber()).to.equal(0)
            expect(totalSupply).to.be.equal(
                balanceOf_C_Original + balanceOf_E_Original - 2 * amount
            )
            expect(totalSupplyByPartition).to.be.equal(totalSupply)

            // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            await new Promise((f) => setTimeout(f, snapshot_1_delay + 1000))

            // transfer
            await expect(
                erc1410Facet.redeemByPartition(_PARTITION_ID_1, amount, data)
            )
                .to.emit(erc1410Facet, 'SnapshotTriggered')
                .withArgs(account_C, 1)

            // check that scheduled snapshots was triggered
            dividend_1 = await equityFacet.getDividends(1)
            dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(1)
            expect(dividend_2.snapshotId.toNumber()).to.equal(0)

            // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            await new Promise((f) =>
                setTimeout(f, snapshot_2_delay - snapshot_1_delay + 1000)
            )

            // transfer From
            await expect(
                erc1410Facet.operatorRedeemByPartition(
                    _PARTITION_ID_1,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            )
                .to.emit(erc1410Facet, 'SnapshotTriggered')
                .withArgs(account_C, 2)

            // check that scheduled snapshots was triggered
            dividend_1 = await equityFacet.getDividends(1)
            dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(1)
            expect(dividend_2.snapshotId.toNumber()).to.equal(2)
        })

        it('GIVEN accounts USING WHITELIST WHEN issue THEN transaction succeeds', async () => {
            // First deploy a new token using white list
            const isWhiteList = true
            const newDiamond = await deployEquityFromFactory(
                account_A,
                isWhiteList,
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
                RegulationSubType.REG_D_506_C,
                true,
                'ES,FR,CH',
                'nothing',
                []
            )
            accessControlFacet = await ethers.getContractAt(
                'AccessControl',
                newDiamond.address
            )

            erc1410Facet = await ethers.getContractAt(
                'ERC1410ScheduledSnapshot',
                newDiamond.address
            )

            controlList = await ethers.getContractAt(
                'ControlList',
                newDiamond.address
            )

            // accounts are blacklisted by default (white list)
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_A)
            await accessControlFacet.grantRole(_CONTROL_LIST_ROLE, account_A)

            // Using account A (with role)
            erc1410Facet = erc1410Facet.connect(signer_A)
            controlList = controlList.connect(signer_A)

            await controlList.addToControlList(account_E)

            // issue succeds
            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_E,
                amount,
                data
            )
        })

        it('GIVEN an account without controller role WHEN controllerTransfer THEN transaction fails with AccountHasNoRole', async () => {
            // Using account C (non role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_C)
            const balanceOf_D_Original = 4 * amount
            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_D,
                balanceOf_D_Original,
                '0x'
            )

            const canTransfer = await erc1410Facet.canTransferByPartition(
                account_D,
                account_E,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )

            // controller transfer fails
            await expect(
                erc1410Facet.controllerTransferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            ).to.be.rejectedWith('AccountHasNoRole')
            expect(canTransfer[0]).to.be.equal(false)
            expect(canTransfer[1]).to.be.equal(_IS_NOT_OPERATOR_ERROR_ID)
        })

        it('GIVEN an account without controller role WHEN controllerRedeem THEN transaction fails with AccountHasNoRole', async () => {
            // Using account C (non role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_C)
            const balanceOf_D_Original = 4 * amount
            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_D,
                balanceOf_D_Original,
                '0x'
            )

            const canRedeem = await erc1410Facet.canRedeemByPartition(
                account_D,
                _PARTITION_ID_1,
                amount,
                data,
                operatorData
            )

            // controller redeem fails
            await expect(
                erc1410Facet.controllerRedeemByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            ).to.be.rejectedWith('AccountHasNoRole')
            expect(canRedeem[0]).to.be.equal(false)
            expect(canRedeem[1]).to.be.equal(_IS_NOT_OPERATOR_ERROR_ID)
        })

        it('GIVEN a paused Token WHEN controllerTransfer THEN transaction fails with TokenIsPaused', async () => {
            // Granting Role to account C and Pause
            await grantRoleAndPauseToken(
                accessControlFacet,
                pauseFacet,
                _CONTROLLER_ROLE,
                signer_A,
                signer_B,
                account_C
            )

            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)

            // controller transfer fails
            await expect(
                erc1410Facet.controllerTransferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    account_E,
                    amount,
                    '0x',
                    '0x'
                )
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN a paused Token WHEN controllerRedeem THEN transaction fails with TokenIsPaused', async () => {
            // Granting Role to account C and Pause
            await grantRoleAndPauseToken(
                accessControlFacet,
                pauseFacet,
                _CONTROLLER_ROLE,
                signer_A,
                signer_B,
                account_C
            )

            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)

            // remove document
            await expect(
                erc1410Facet.controllerRedeemByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    '0x',
                    '0x'
                )
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN an account with controller role WHEN controllerTransfer and controllerRedeem THEN transaction succeeds', async () => {
            // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            // Granting Role to account C
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_CONTROLLER_ROLE, account_C)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_C)
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // Using account C (with role)
            erc1410Facet = erc1410Facet.connect(signer_C)
            equityFacet = equityFacet.connect(signer_C)
            // issueing 2 tokens to account D
            const balanceOf_D_Original = 4 * amount
            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_D,
                balanceOf_D_Original,
                '0x'
            )
            // scheduling 2 snapshots
            const currentTimeInSeconds = (
                await ethers.provider.getBlock('latest')
            ).timestamp
            const dividendsRecordDateInSeconds_1 =
                currentTimeInSeconds + snapshot_1_delay / 1000
            const dividendsRecordDateInSeconds_2 =
                currentTimeInSeconds + snapshot_2_delay / 1000
            const dividendsExecutionDateInSeconds =
                currentTimeInSeconds + 10 * (snapshot_2_delay / 1000)
            const dividendData_1 = {
                recordDate: dividendsRecordDateInSeconds_1.toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: 1,
            }
            const dividendData_2 = {
                recordDate: dividendsRecordDateInSeconds_2.toString(),
                executionDate: dividendsExecutionDateInSeconds.toString(),
                amount: 1,
            }
            await equityFacet.setDividends(dividendData_1)
            await equityFacet.setDividends(dividendData_2)

            // controller transfer
            await expect(
                erc1410Facet.controllerTransferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            )
                .to.emit(erc1410Facet, 'TransferByPartition')
                .withArgs(
                    _PARTITION_ID_1,
                    account_C,
                    account_D,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            // controller redeem
            await expect(
                erc1410Facet.controllerRedeemByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            )
                .to.emit(erc1410Facet, 'RedeemedByPartition')
                .withArgs(
                    _PARTITION_ID_1,
                    account_C,
                    account_D,
                    amount,
                    data,
                    operatorData
                )

            // check amounts
            const balanceOf_D = await erc1410Facet.balanceOf(account_D)
            const balanceOf_D_Partition_1 =
                await erc1410Facet.balanceOfByPartition(
                    _PARTITION_ID_1,
                    account_D
                )
            expect(balanceOf_D).to.equal(balanceOf_D_Original - 2 * amount)
            expect(balanceOf_D_Partition_1).to.equal(balanceOf_D)
            const balanceOf_E = await erc1410Facet.balanceOf(account_E)
            const balanceOf_E_Partition_1 =
                await erc1410Facet.balanceOfByPartition(
                    _PARTITION_ID_1,
                    account_E
                )
            expect(balanceOf_E).to.equal(balanceOf_E_Original + amount)
            expect(balanceOf_E_Partition_1).to.equal(balanceOf_E)
            let dividend_1 = await equityFacet.getDividends(1)
            let dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(0)
            expect(dividend_2.snapshotId.toNumber()).to.equal(0)

            // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            await new Promise((f) => setTimeout(f, snapshot_1_delay + 1000))

            // controller transfer
            await expect(
                erc1410Facet.controllerTransferByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    account_E,
                    amount,
                    data,
                    operatorData
                )
            )
                .to.emit(erc1410Facet, 'SnapshotTriggered')
                .withArgs(account_C, 1)

            // check that scheduled snapshots was triggered
            dividend_1 = await equityFacet.getDividends(1)
            dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(1)
            expect(dividend_2.snapshotId.toNumber()).to.equal(0)

            // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
            await new Promise((f) =>
                setTimeout(f, snapshot_2_delay - snapshot_1_delay + 1000)
            )

            // controller redeem
            await expect(
                erc1410Facet.controllerRedeemByPartition(
                    _PARTITION_ID_1,
                    account_D,
                    amount,
                    data,
                    operatorData
                )
            )
                .to.emit(erc1410Facet, 'SnapshotTriggered')
                .withArgs(account_C, 2)

            // check that scheduled snapshots was triggered
            dividend_1 = await equityFacet.getDividends(1)
            dividend_2 = await equityFacet.getDividends(2)
            expect(dividend_1.snapshotId.toNumber()).to.equal(1)
            expect(dividend_2.snapshotId.toNumber()).to.equal(2)
        })
    })
    describe('Multi partition ', () => {
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

            erc1410Facet = await ethers.getContractAt(
                'ERC1410ScheduledSnapshot',
                diamond.address
            )

            equityFacet = await ethers.getContractAt('Equity', diamond.address)

            pauseFacet = await ethers.getContractAt('Pause', diamond.address)

            controlList = await ethers.getContractAt(
                'ControlList',
                diamond.address
            )

            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_A)
            erc1410Facet = erc1410Facet.connect(signer_A)

            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_C,
                balanceOf_C_Original,
                '0x'
            )
            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_E,
                balanceOf_E_Original,
                '0x'
            )
        })

        it(
            'GIVEN initialized erc1410 token ' +
                'WHEN don not use default partition ' +
                'THEN fails with InvalidPartition',
            async () => {
                await expect(
                    erc1410Facet.transferByPartition(
                        _PARTITION_ID_2,
                        account_D,
                        amount,
                        data
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc1410Facet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_PARTITION_ID_2)
                await expect(
                    erc1410Facet.controllerTransferByPartition(
                        _PARTITION_ID_2,
                        account_C,
                        account_D,
                        amount,
                        data,
                        data
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc1410Facet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_PARTITION_ID_2)
                await expect(
                    erc1410Facet.controllerRedeemByPartition(
                        _PARTITION_ID_2,
                        account_D,
                        amount,
                        data,
                        data
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc1410Facet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_PARTITION_ID_2)
                // TODO canTransferByPartition
                await expect(
                    erc1410Facet.operatorTransferByPartition(
                        _PARTITION_ID_2,
                        account_C,
                        account_D,
                        amount,
                        data,
                        data
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc1410Facet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_PARTITION_ID_2)
                await expect(
                    erc1410Facet.authorizeOperatorByPartition(
                        _PARTITION_ID_2,
                        account_C
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc1410Facet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_PARTITION_ID_2)
                await expect(
                    erc1410Facet.revokeOperatorByPartition(
                        _PARTITION_ID_2,
                        account_C
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc1410Facet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_PARTITION_ID_2)
                await expect(
                    erc1410Facet.redeemByPartition(
                        _PARTITION_ID_2,
                        amount,
                        data
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc1410Facet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_PARTITION_ID_2)
                await expect(
                    erc1410Facet.operatorRedeemByPartition(
                        _PARTITION_ID_2,
                        account_C,
                        amount,
                        data,
                        data
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc1410Facet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_PARTITION_ID_2)
                await expect(
                    erc1410Facet.issueByPartition(
                        _PARTITION_ID_2,
                        account_C,
                        amount,
                        data
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc1410Facet,
                        'PartitionNotAllowedInSinglePartitionMode'
                    )
                    .withArgs(_PARTITION_ID_2)
                // TODO canRedeemByPartition
            }
        )
    })
})
