import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type ERC1644,
    type Pause,
    type ERC1594,
    type AccessControl,
    type Equity,
    ERC1410ScheduledSnapshot,
} from '../../../../../typechain-types'
import { deployEnvironment } from '../../../../../scripts/deployEnvironmentByRpc'
import {
    _CORPORATE_ACTION_ROLE,
    _ISSUER_ROLE,
    _CONTROLLER_ROLE,
    _PAUSER_ROLE,
    _DEFAULT_PARTITION,
} from '../../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { grantRoleAndPauseToken } from '../../../../../scripts/testCommon'

const amount = 1
const data = '0x1234'
const operatorData = '0x5678'

describe('ERC1644 Tests', () => {
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

    let erc1644Facet: ERC1644
    let erc1594Facet: ERC1594
    let accessControlFacet: AccessControl
    let pauseFacet: Pause
    let equityFacet: Equity
    let erc1410Facet: ERC1410ScheduledSnapshot

    describe('single partition', () => {
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
            const rbacIssuable: Rbac = {
                role: _ISSUER_ROLE,
                members: [account_B],
            }
            const rbacController: Rbac = {
                role: _CONTROLLER_ROLE,
                members: [account_B],
            }
            const init_rbacs: Rbac[] = [rbacPause, rbacIssuable, rbacController]

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

            erc1644Facet = await ethers.getContractAt(
                'ERC1644',
                diamond.address
            )

            erc1594Facet = await ethers.getContractAt(
                'ERC1594',
                diamond.address
            )

            equityFacet = await ethers.getContractAt('Equity', diamond.address)

            pauseFacet = await ethers.getContractAt('Pause', diamond.address)

            erc1410Facet = await ethers.getContractAt(
                'ERC1410ScheduledSnapshot',
                diamond.address,
                signer_B
            )
        })

        it('GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized', async () => {
            await expect(
                erc1644Facet.initialize_ERC1644(false)
            ).to.be.rejectedWith('AlreadyInitialized')
        })

        describe('Paused', () => {
            beforeEach(async () => {
                // Granting Role to account C and Pause
                await grantRoleAndPauseToken(
                    accessControlFacet,
                    pauseFacet,
                    _CONTROLLER_ROLE,
                    signer_A,
                    signer_B,
                    account_C
                )
            })
            it('GIVEN a paused Token WHEN controllerTransfer THEN transaction fails with TokenIsPaused', async () => {
                // Using account C (with role)
                erc1644Facet = erc1644Facet.connect(signer_C)

                // controller transfer fails
                await expect(
                    erc1644Facet.controllerTransfer(
                        account_D,
                        account_E,
                        amount,
                        '0x',
                        '0x'
                    )
                ).to.eventually.be.rejectedWith(Error)
            })

            it('GIVEN a paused Token WHEN controllerRedeem THEN transaction fails with TokenIsPaused', async () => {
                // Using account C (with role)
                erc1644Facet = erc1644Facet.connect(signer_C)

                // remove document
                await expect(
                    erc1644Facet.controllerRedeem(account_D, amount, '0x', '0x')
                ).to.eventually.be.rejectedWith(Error)
            })
        })

        describe('AccessControl', () => {
            it('GIVEN an account without admin role WHEN finalizeControllable THEN transaction fails with AccountHasNoRole', async () => {
                // Using account C (non role)
                erc1644Facet = erc1644Facet.connect(signer_C)

                // controller finalize fails
                await expect(
                    erc1644Facet.finalizeControllable()
                ).to.be.rejectedWith('AccountHasNoRole')
            })

            it('GIVEN an account without controller role WHEN controllerTransfer THEN transaction fails with AccountHasNoRole', async () => {
                // Using account C (non role)
                erc1644Facet = erc1644Facet.connect(signer_C)

                // controller transfer fails
                await expect(
                    erc1644Facet.controllerTransfer(
                        account_D,
                        account_E,
                        amount,
                        data,
                        operatorData
                    )
                ).to.be.rejectedWith('AccountHasNoRole')
            })

            it('GIVEN an account without controller role WHEN controllerRedeem THEN transaction fails with AccountHasNoRole', async () => {
                // Using account C (non role)
                erc1644Facet = erc1644Facet.connect(signer_C)

                // controller redeem fails
                await expect(
                    erc1644Facet.controllerRedeem(
                        account_D,
                        amount,
                        data,
                        operatorData
                    )
                ).to.be.rejectedWith('AccountHasNoRole')
            })
        })

        describe('Controllable', () => {
            beforeEach(async () => {
                // BEFORE SCHEDULED SNAPSHOTS ------------------------------------------------------------------
                // Granting Role to account C
                await erc1410Facet
                    .connect(signer_B)
                    .issueByPartition(
                        _DEFAULT_PARTITION,
                        account_D,
                        amount * 2,
                        data
                    )
            })

            it(
                'GIVEN a controllable token ' +
                    'WHEN controllerTransfer ' +
                    'THEN transaction succeeds',
                async () => {
                    expect(
                        await erc1644Facet
                            .connect(signer_B)
                            .controllerTransfer(
                                account_D,
                                account_E,
                                amount,
                                data,
                                operatorData
                            )
                    )
                        .to.emit(erc1644Facet, 'ControllerTransfer')
                        .withArgs(
                            account_B,
                            account_D,
                            account_E,
                            amount,
                            data,
                            data
                        )
                    expect(await erc1410Facet.totalSupply()).to.equal(
                        amount * 2
                    )
                    expect(await erc1410Facet.balanceOf(account_D)).to.equal(
                        amount
                    )
                    expect(await erc1410Facet.balanceOf(account_E)).to.equal(
                        amount
                    )
                    expect(
                        await erc1410Facet.totalSupplyByPartition(
                            _DEFAULT_PARTITION
                        )
                    ).to.equal(amount * 2)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            _DEFAULT_PARTITION,
                            account_D
                        )
                    ).to.equal(amount)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            _DEFAULT_PARTITION,
                            account_E
                        )
                    ).to.equal(amount)
                }
            )

            it(
                'GIVEN a controllable token ' +
                    'WHEN controllerRedeem ' +
                    'THEN transaction succeeds',
                async () => {
                    expect(
                        await erc1644Facet
                            .connect(signer_B)
                            .controllerRedeem(
                                account_D,
                                amount,
                                data,
                                operatorData
                            )
                    )
                        .to.emit(erc1644Facet, 'ControllerRedemption')
                        .withArgs(account_B, account_D, amount, data, data)
                    expect(await erc1410Facet.totalSupply()).to.equal(amount)
                    expect(await erc1410Facet.balanceOf(account_D)).to.equal(
                        amount
                    )
                    expect(
                        await erc1410Facet.totalSupplyByPartition(
                            _DEFAULT_PARTITION
                        )
                    ).to.equal(amount)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            _DEFAULT_PARTITION,
                            account_D
                        )
                    ).to.equal(amount)
                }
            )
        })

        describe('finalizeControllable', () => {
            beforeEach(async () => {
                // Using account C (non role)
                accessControlFacet = accessControlFacet.connect(signer_A)
                await accessControlFacet.grantRole(_CONTROLLER_ROLE, account_A)
                await accessControlFacet.grantRole(_ISSUER_ROLE, account_C)

                // controller finalize fails
                erc1644Facet = erc1644Facet.connect(signer_A)
                erc1594Facet = erc1594Facet.connect(signer_C)

                await expect(erc1644Facet.finalizeControllable())
                    .to.emit(erc1644Facet, 'FinalizedControllerFeature')
                    .withArgs(account_A)
            })

            it('GIVEN an account with admin role WHEN finalizeControllable THEN transaction succeeds', async () => {
                const isControllable = await erc1644Facet.isControllable()
                expect(isControllable).to.equal(false)
            })

            it('GIVEN finalizeControllable WHEN controllerTransfer THEN TokenIsNotControllable', async () => {
                await expect(
                    erc1644Facet.controllerTransfer(
                        account_D,
                        account_E,
                        amount,
                        data,
                        operatorData
                    )
                ).to.revertedWithCustomError(
                    erc1644Facet,
                    'TokenIsNotControllable'
                )
            })

            it('GIVEN finalizeControllable WHEN controllerRedeem THEN TokenIsNotControllable', async () => {
                await expect(
                    erc1644Facet.controllerRedeem(
                        account_E,
                        amount,
                        data,
                        operatorData
                    )
                ).to.revertedWithCustomError(
                    erc1644Facet,
                    'TokenIsNotControllable'
                )
            })

            it('GIVEN finalizeControllable WHEN finalizeControllable THEN TokenIsNotControllable', async () => {
                await expect(
                    erc1644Facet.finalizeControllable()
                ).to.revertedWithCustomError(
                    erc1644Facet,
                    'TokenIsNotControllable'
                )
            })
        })
    })

    describe('multi partition', () => {
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
                RegulationSubType.REG_D_506_C,
                true,
                'ES,FR,CH',
                'nothing',
                init_rbacs
            )

            accessControlFacet = await ethers.getContractAt(
                'AccessControl',
                diamond.address
            )

            erc1644Facet = await ethers.getContractAt(
                'ERC1644',
                diamond.address
            )

            erc1594Facet = await ethers.getContractAt(
                'ERC1594',
                diamond.address
            )

            equityFacet = await ethers.getContractAt('Equity', diamond.address)

            pauseFacet = await ethers.getContractAt('Pause', diamond.address)
        })

        describe('NotAllowedInMultiPartitionMode', () => {
            beforeEach(async () => {
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
                erc1644Facet = erc1644Facet.connect(signer_C)
                erc1594Facet = erc1594Facet.connect(signer_C)
                equityFacet = equityFacet.connect(signer_C)
            })

            it('GIVEN an account with controller role WHEN controllerTransfer THEN NotAllowedInMultiPartitionMode', async () => {
                // check is controllable
                const isControllable = await erc1644Facet.isControllable()
                expect(isControllable).to.equal(true)

                // controller transfer
                await expect(
                    erc1644Facet.controllerTransfer(
                        account_D,
                        account_E,
                        amount,
                        data,
                        operatorData
                    )
                ).to.revertedWithCustomError(
                    erc1644Facet,
                    'NotAllowedInMultiPartitionMode'
                )
            })

            it('GIVEN an account with controller role WHEN controllerRedeem THEN NotAllowedInMultiPartitionMode', async () => {
                // check is controllable
                const isControllable = await erc1644Facet.isControllable()
                expect(isControllable).to.equal(true)

                // controller transfer
                await expect(
                    erc1644Facet.controllerRedeem(
                        account_D,
                        amount,
                        data,
                        operatorData
                    )
                ).to.revertedWithCustomError(
                    erc1644Facet,
                    'NotAllowedInMultiPartitionMode'
                )
            })
        })
    })
})
