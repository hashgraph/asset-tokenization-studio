import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type ERC20,
    type ERC1410Snapshot,
    type Pause,
    type ControlList,
    type ERC1594,
} from '../../../../../typechain-types'
import { deployEnvironment } from '../../../../../scripts/deployEnvironmentByRpc'
import {
    _CONTROL_LIST_ROLE,
    _PAUSER_ROLE,
    _ISSUER_ROLE,
    _DEFAULT_PARTITION,
} from '../../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
    SecurityType,
} from '../../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { assertObject } from '../../../../assert'

const amount = 1000

describe('ERC20 Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let signer_E: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string
    let account_E: string

    let erc20Facet: ERC20
    let erc20FacetBlackList: ERC20
    let pauseFacet: Pause
    let controlListFacet: ControlList
    let erc1594Facet: ERC1594

    const name = 'TEST_AccessControl'
    const symbol = 'TAC'
    const decimals = 6
    const isin = 'ABCDEF123456'

    describe('Multi partition', () => {
        beforeEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-extra-semi
            ;[signer_A, signer_B, signer_C, signer_E] =
                await ethers.getSigners()
            account_A = signer_A.address
            account_B = signer_B.address
            account_C = signer_C.address
            account_E = signer_E.address

            await deployEnvironment()

            const rbacPause: Rbac = {
                role: _PAUSER_ROLE,
                members: [account_B],
            }
            const rbacControlList: Rbac = {
                role: _CONTROL_LIST_ROLE,
                members: [account_A],
            }
            const init_rbacs: Rbac[] = [rbacPause, rbacControlList]

            diamond = await deployEquityFromFactory(
                account_A,
                false,
                true,
                true,
                name,
                symbol,
                decimals,
                isin,
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

            erc20Facet = await ethers.getContractAt('ERC20', diamond.address)
            erc20FacetBlackList = await ethers.getContractAt(
                'ERC20',
                diamond.address,
                signer_E
            )
            pauseFacet = await ethers.getContractAt(
                'Pause',
                diamond.address,
                signer_B
            )
            controlListFacet = await ethers.getContractAt(
                'ControlList',
                diamond.address,
                signer_A
            )
        })

        it('GIVEN a initialized ERC20 WHEN initialize again THEN transaction fails with AlreadyInitialized', async () => {
            // initialize fails
            const info = {
                name: 'TEST',
                symbol: 'TST',
                isin: 'ES1234567890',
                decimals: 6,
            }

            await expect(
                erc20Facet.initialize_ERC20({
                    info: info,
                    securityType: SecurityType.BOND,
                })
            ).to.be.revertedWithCustomError(erc20Facet, 'AlreadyInitialized')
        })

        it('GIVEN a initialized ERC20 WHEN getERC20Metadata THEN obtain configured metadata', async () => {
            // initialize fails
            const erc20Metadata = await erc20Facet.getERC20Metadata()
            assertObject(erc20Metadata.info, {
                name: name,
                symbol: symbol,
                isin: isin,
                decimals: decimals,
            })
            expect(erc20Metadata.securityType).to.be.equal(SecurityType.EQUITY)
        })

        it('GIVEN a initialized ERC20 WHEN name, symbol, decimals THEN obtain configured metadata', async () => {
            // initialize fails
            const retrieved_name = await erc20Facet.name()
            const retrieved_symbol = await erc20Facet.symbol()
            const retrieved_decimals = await erc20Facet.decimals()

            expect(retrieved_name).to.equal(name)
            expect(retrieved_symbol).to.equal(symbol)
            expect(retrieved_decimals).to.equal(decimals)
        })

        it('GIVEN a paused ERC20 WHEN running any state changing method THEN transaction fails with TokenIsPaused', async () => {
            await pauseFacet.pause()

            await expect(
                erc20Facet.approve(account_E, amount)
            ).to.be.rejectedWith('TokenIsPaused')

            await expect(
                erc20Facet.transfer(account_E, amount)
            ).to.be.rejectedWith('TokenIsPaused')

            await expect(
                erc20Facet.transferFrom(account_C, account_E, amount)
            ).to.be.rejectedWith('TokenIsPaused')

            await expect(
                erc20Facet.increaseAllowance(account_C, amount)
            ).to.be.rejectedWith('TokenIsPaused')

            await expect(
                erc20Facet.decreaseAllowance(account_C, amount)
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN a initializer ERC20 WHEN try to use a non authorized account THEN transaction fails with AccountIsBlocked', async () => {
            await controlListFacet.addToControlList(account_E)

            await expect(
                erc20FacetBlackList.approve(account_A, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.approve(account_E, amount)
            ).to.be.rejectedWith('AccountIsBlocked')

            await expect(
                erc20FacetBlackList.transfer(account_A, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.transfer(account_E, amount)
            ).to.be.rejectedWith('AccountIsBlocked')

            await expect(
                erc20FacetBlackList.transferFrom(account_A, account_B, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.transferFrom(account_E, account_C, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.transferFrom(account_C, account_E, amount)
            ).to.be.rejectedWith('AccountIsBlocked')

            await expect(
                erc20FacetBlackList.increaseAllowance(account_A, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.increaseAllowance(account_E, amount)
            ).to.be.rejectedWith('AccountIsBlocked')

            await expect(
                erc20FacetBlackList.decreaseAllowance(account_A, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.decreaseAllowance(account_E, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
        })

        it('GIVEN a initialized ERC20 WHEN running any state changing method THEN transaction fails with NotAllowedInMultiPartitionMode', async () => {
            erc20Facet = erc20Facet.connect(signer_A)

            await expect(
                erc20Facet.approve(account_E, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')

            await expect(
                erc20Facet.transfer(account_E, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')

            await expect(
                erc20Facet.transferFrom(account_C, account_E, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')

            await expect(
                erc20Facet.increaseAllowance(account_C, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')

            await expect(
                erc20Facet.decreaseAllowance(account_C, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')
        })
    })

    describe('Single partition', () => {
        let erc20SignerC: ERC20
        let erc20SignerE: ERC20
        let erc1410Facet: ERC1410Snapshot

        beforeEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-extra-semi
            ;[signer_A, signer_B, signer_C, signer_E] =
                await ethers.getSigners()
            account_A = signer_A.address
            account_B = signer_B.address
            account_C = signer_C.address
            account_E = signer_E.address

            await deployEnvironment()

            const rbacIssuer: Rbac = {
                role: _ISSUER_ROLE,
                members: [account_B],
            }
            const init_rbacs: Rbac[] = [rbacIssuer]

            diamond = await deployEquityFromFactory(
                account_A,
                false,
                true,
                false,
                name,
                symbol,
                decimals,
                isin,
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

            erc20Facet = await ethers.getContractAt('ERC20', diamond.address)
            erc20SignerC = await ethers.getContractAt(
                'ERC20',
                diamond.address,
                signer_C
            )
            erc20SignerE = await ethers.getContractAt(
                'ERC20',
                diamond.address,
                signer_E
            )
            erc1410Facet = await ethers.getContractAt(
                'ERC1410Snapshot',
                diamond.address
            )
            erc1594Facet = await ethers.getContractAt(
                'ERC1594',
                diamond.address,
                signer_B
            )
            await erc1594Facet.issue(account_C, amount, '0x')
        })

        describe('Approval', () => {
            it(
                'GIVEN a account with balance ' +
                    'WHEN approve to a zero account ' +
                    'THEN fails with SpenderWithZeroAddress',
                async () => {
                    await expect(
                        erc20SignerC.approve(
                            ethers.constants.AddressZero,
                            amount / 2
                        )
                    ).to.revertedWithCustomError(
                        erc20Facet,
                        'SpenderWithZeroAddress'
                    )
                }
            )

            it(
                'GIVEN a account with balance ' +
                    'WHEN increaseAllowance to a zero account ' +
                    'THEN fails with SpenderWithZeroAddress',
                async () => {
                    await expect(
                        erc20SignerC.increaseAllowance(
                            ethers.constants.AddressZero,
                            amount / 2
                        )
                    ).to.revertedWithCustomError(
                        erc20Facet,
                        'SpenderWithZeroAddress'
                    )
                }
            )

            it(
                'GIVEN a account with balance ' +
                    'WHEN decreaseAllowance to a zero account ' +
                    'THEN fails with SpenderWithZeroAddress',
                async () => {
                    await expect(
                        erc20SignerC.decreaseAllowance(
                            ethers.constants.AddressZero,
                            amount / 2
                        )
                    ).to.revertedWithCustomError(
                        erc20Facet,
                        'SpenderWithZeroAddress'
                    )
                }
            )

            it(
                'GIVEN a account without balance ' +
                    'WHEN decreaseAllowance to a valid account ' +
                    'THEN fails with InsufficientAllowance',
                async () => {
                    await expect(
                        erc20SignerE.decreaseAllowance(account_B, amount / 2)
                    )
                        .to.revertedWithCustomError(
                            erc20Facet,
                            'InsufficientAllowance'
                        )
                        .withArgs(account_B, account_E)
                }
            )

            it(
                'GIVEN a account with balance ' +
                    'WHEN approve to another whitelisted account ' +
                    'THEN emits Approval event and allowance is updated',
                async () => {
                    expect(await erc20SignerC.approve(account_E, amount / 2))
                        .to.emit(erc20SignerC, 'Approval')
                        .withArgs(account_C, account_E, amount / 2)
                    expect(
                        await erc20SignerC.allowance(account_C, account_E)
                    ).to.be.equal(amount / 2)
                }
            )

            it(
                'GIVEN a account with balance ' +
                    'WHEN increaseAllowance to another whitelisted account ' +
                    'THEN emits Approval event and allowance is updated',
                async () => {
                    expect(
                        await erc20SignerC.increaseAllowance(
                            account_E,
                            amount / 2
                        )
                    )
                        .to.emit(erc20SignerC, 'Approval')
                        .withArgs(account_C, account_E, amount / 2)
                    expect(
                        await erc20SignerC.allowance(account_C, account_E)
                    ).to.be.equal(amount / 2)
                }
            )

            it(
                'GIVEN a account with balance ' +
                    'WHEN decreaseAllowance to another whitelisted account ' +
                    'THEN emits Approval event and allowance is updated',
                async () => {
                    await erc20SignerC.increaseAllowance(account_E, amount)
                    expect(
                        await erc20SignerC.decreaseAllowance(
                            account_E,
                            amount / 2
                        )
                    )
                        .to.emit(erc20SignerC, 'Approval')
                        .withArgs(account_C, account_E, amount / 2)
                    expect(
                        await erc20SignerC.allowance(account_C, account_E)
                    ).to.be.equal(amount / 2)
                }
            )
        })

        describe('transfer', () => {
            it(
                'GIVEN an account with balance ' +
                    'WHEN transfer to another whitelisted account ' +
                    'THEN emits Transfer event and balances are updated',
                async () => {
                    expect(await erc20SignerC.transfer(account_E, amount / 2))
                        .to.emit(erc20SignerC, 'Transfer')
                        .withArgs(account_C, account_E, amount)
                    expect(await erc1410Facet.balanceOf(account_C)).to.be.equal(
                        amount / 2
                    )
                    expect(await erc1410Facet.balanceOf(account_E)).to.be.equal(
                        amount / 2
                    )
                    expect(await erc1410Facet.totalSupply()).to.be.equal(amount)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            _DEFAULT_PARTITION,
                            account_C
                        )
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            _DEFAULT_PARTITION,
                            account_E
                        )
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.totalSupplyByPartition(
                            _DEFAULT_PARTITION
                        )
                    ).to.be.equal(amount)
                }
            )
        })

        describe('transferFrom', () => {
            beforeEach(async () => {
                await erc20SignerC.approve(account_E, amount)
            })

            it(
                'GIVEN an account with allowance ' +
                    'WHEN transferFrom to another whitelisted account ' +
                    'THEN emits Transfer event and balances are updated',
                async () => {
                    expect(
                        await erc20SignerE.transferFrom(
                            account_C,
                            account_E,
                            amount / 2
                        )
                    )
                        .to.emit(erc20SignerC, 'Transfer')
                        .withArgs(account_C, account_E, amount)
                    expect(await erc1410Facet.balanceOf(account_C)).to.be.equal(
                        amount / 2
                    )
                    expect(await erc1410Facet.balanceOf(account_E)).to.be.equal(
                        amount / 2
                    )
                    expect(await erc1410Facet.totalSupply()).to.be.equal(amount)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            _DEFAULT_PARTITION,
                            account_C
                        )
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            _DEFAULT_PARTITION,
                            account_E
                        )
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.totalSupplyByPartition(
                            _DEFAULT_PARTITION
                        )
                    ).to.be.equal(amount)
                }
            )
        })
    })
})
