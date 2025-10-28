import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { isinGenerator } from '@thomaschaplin/isin-generator'
import {
    type ResolverProxy,
    type ERC20,
    type IERC1410,
    type Pause,
    type ControlList,
    type ERC1594,
    Kyc,
    SsiManagement,
    ClearingActionsFacet,
} from '@contract-types'
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_STRING, ZERO } from '@scripts'
import { assertObject } from '../../../../common'
import { deployEquityTokenFixture } from '@test'
import { executeRbac, MAX_UINT256 } from '@test'
import { SecurityType } from '@scripts/domain'

const amount = 1000
// con erc20 y sin erc1410 funciona
// sin erc20 y con erc1410 funciona
// con erc20 y con erc1410 NO funciona
describe('ERC20 Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let signer_D: SignerWithAddress

    let erc20Facet: ERC20
    let erc20FacetBlackList: ERC20
    let pauseFacet: Pause
    let controlListFacet: ControlList
    let erc1594Facet: ERC1594
    let kycFacet: Kyc
    let ssiManagementFacet: SsiManagement
    let clearingActionsFacet: ClearingActionsFacet

    const name = 'TEST_AccessControl'
    const symbol = 'TAC'
    const decimals = 6
    const isin = isinGenerator()
    const EMPTY_VC_ID = EMPTY_STRING

    describe('Multi partition', () => {
        async function deploySecurityFixtureMultiPartition() {
            const base = await deployEquityTokenFixture({
                equityDataParams: {
                    securityData: {
                        isMultiPartition: true,
                        erc20MetadataInfo: { name, symbol, isin },
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
                    role: ATS_ROLES._PAUSER_ROLE,
                    members: [signer_B.address],
                },
                {
                    role: ATS_ROLES._CONTROL_LIST_ROLE,
                    members: [signer_A.address],
                },
                {
                    role: ATS_ROLES._CLEARING_ROLE,
                    members: [signer_A.address],
                },
            ])

            erc20Facet = await ethers.getContractAt('ERC20', diamond.address)
            erc20FacetBlackList = await ethers.getContractAt(
                'ERC20',
                diamond.address,
                signer_D
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
            clearingActionsFacet = await ethers.getContractAt(
                'ClearingActionsFacet',
                diamond.address,
                signer_A
            )
        }
        beforeEach(async () => {
            await loadFixture(deploySecurityFixtureMultiPartition)
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

        it('GIVEN a initialized ERC20 WHEN running any state changing method THEN transaction fails with NotAllowedInMultiPartitionMode', async () => {
            await expect(
                erc20Facet.connect(signer_A).approve(signer_D.address, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')

            await expect(
                erc20Facet.connect(signer_A).transfer(signer_D.address, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')

            await expect(
                erc20Facet
                    .connect(signer_A)
                    .transferFrom(signer_C.address, signer_D.address, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')

            await expect(
                erc20Facet
                    .connect(signer_A)
                    .increaseAllowance(signer_C.address, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')

            await expect(
                erc20Facet
                    .connect(signer_A)
                    .decreaseAllowance(signer_C.address, amount)
            ).to.be.rejectedWith('NotAllowedInMultiPartitionMode')
        })
    })

    describe('Single partition', () => {
        let erc20SignerC: ERC20
        let erc20SignerE: ERC20
        let erc1410Facet: IERC1410

        async function deploySecurityFixtureSinglePartition() {
            const base = await deployEquityTokenFixture()
            diamond = base.diamond
            signer_A = base.deployer
            signer_B = base.user1
            signer_C = base.user2
            signer_D = base.user3

            await executeRbac(base.accessControlFacet, [
                {
                    role: ATS_ROLES._ISSUER_ROLE,
                    members: [signer_B.address],
                },
                {
                    role: ATS_ROLES._KYC_ROLE,
                    members: [signer_B.address],
                },
                {
                    role: ATS_ROLES._SSI_MANAGER_ROLE,
                    members: [signer_A.address],
                },
                {
                    role: ATS_ROLES._PAUSER_ROLE,
                    members: [signer_B.address],
                },
                {
                    role: ATS_ROLES._CLEARING_ROLE,
                    members: [signer_A.address],
                },
                {
                    role: ATS_ROLES._CONTROL_LIST_ROLE,
                    members: [signer_A.address],
                },
            ])

            erc20Facet = await ethers.getContractAt('ERC20', diamond.address)
            erc20FacetBlackList = await ethers.getContractAt(
                'ERC20',
                diamond.address,
                signer_D
            )
            erc20SignerC = await ethers.getContractAt(
                'ERC20',
                diamond.address,
                signer_C
            )
            erc20SignerE = await ethers.getContractAt(
                'ERC20',
                diamond.address,
                signer_D
            )
            erc1410Facet = await ethers.getContractAt(
                'IERC1410',
                diamond.address
            )
            erc1594Facet = await ethers.getContractAt(
                'ERC1594',
                diamond.address,
                signer_B
            )
            kycFacet = await ethers.getContractAt(
                'Kyc',
                diamond.address,
                signer_B
            )
            ssiManagementFacet = await ethers.getContractAt(
                'SsiManagement',
                diamond.address,
                signer_A
            )
            pauseFacet = await ethers.getContractAt(
                'Pause',
                diamond.address,
                signer_B
            )

            clearingActionsFacet = await ethers.getContractAt(
                'ClearingActionsFacet',
                diamond.address,
                signer_A
            )
            controlListFacet = await ethers.getContractAt(
                'ControlList',
                diamond.address,
                signer_A
            )
            await ssiManagementFacet.addIssuer(signer_D.address)
            await kycFacet.grantKyc(
                signer_C.address,
                EMPTY_VC_ID,
                ZERO,
                MAX_UINT256,
                signer_D.address
            )
            await kycFacet.grantKyc(
                signer_D.address,
                EMPTY_VC_ID,
                ZERO,
                MAX_UINT256,
                signer_D.address
            )
            await erc1594Facet.issue(signer_C.address, amount, '0x')
        }

        beforeEach(async () => {
            await loadFixture(deploySecurityFixtureSinglePartition)
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
                        erc20SignerE.decreaseAllowance(
                            signer_B.address,
                            amount / 2
                        )
                    )
                        .to.revertedWithCustomError(
                            erc20Facet,
                            'InsufficientAllowance'
                        )
                        .withArgs(signer_B.address, signer_D.address)
                }
            )

            it(
                'GIVEN a account with balance ' +
                    'WHEN approve to another whitelisted account ' +
                    'THEN emits Approval event and allowance is updated',
                async () => {
                    expect(
                        await erc20SignerC.approve(signer_D.address, amount / 2)
                    )
                        .to.emit(erc20SignerC, 'Approval')
                        .withArgs(
                            signer_C.address,
                            signer_D.address,
                            amount / 2
                        )
                    expect(
                        await erc20SignerC.allowance(
                            signer_C.address,
                            signer_D.address
                        )
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
                            signer_D.address,
                            amount / 2
                        )
                    )
                        .to.emit(erc20SignerC, 'Approval')
                        .withArgs(
                            signer_C.address,
                            signer_D.address,
                            amount / 2
                        )
                    expect(
                        await erc20SignerC.allowance(
                            signer_C.address,
                            signer_D.address
                        )
                    ).to.be.equal(amount / 2)
                }
            )

            it(
                'GIVEN a account with balance ' +
                    'WHEN decreaseAllowance to another whitelisted account ' +
                    'THEN emits Approval event and allowance is updated',
                async () => {
                    await erc20SignerC.increaseAllowance(
                        signer_D.address,
                        amount
                    )
                    expect(
                        await erc20SignerC.decreaseAllowance(
                            signer_D.address,
                            amount / 2
                        )
                    )
                        .to.emit(erc20SignerC, 'Approval')
                        .withArgs(
                            signer_C.address,
                            signer_D.address,
                            amount / 2
                        )
                    expect(
                        await erc20SignerC.allowance(
                            signer_C.address,
                            signer_D.address
                        )
                    ).to.be.equal(amount / 2)
                }
            )
        })

        describe('transfer', () => {
            it('GIVEN a non kyc account THEN transfer fails with InvalidKycStatus', async () => {
                await kycFacet.revokeKyc(signer_D.address)
                await expect(
                    erc20SignerC.transfer(signer_D.address, amount / 2)
                ).to.revertedWithCustomError(kycFacet, 'InvalidKycStatus')

                await kycFacet.grantKyc(
                    signer_D.address,
                    EMPTY_VC_ID,
                    ZERO,
                    MAX_UINT256,
                    signer_D.address
                )

                await kycFacet.revokeKyc(signer_C.address)
                await expect(
                    erc20SignerC.transfer(signer_D.address, amount / 2)
                ).to.revertedWithCustomError(kycFacet, 'InvalidKycStatus')
            })
            it(
                'GIVEN an account with balance ' +
                    'WHEN transfer to another whitelisted account ' +
                    'THEN emits Transfer event and balances are updated',
                async () => {
                    expect(
                        await erc20SignerC.transfer(
                            signer_D.address,
                            amount / 2
                        )
                    )
                        .to.emit(erc20SignerC, 'Transfer')
                        .withArgs(signer_C.address, signer_D.address, amount)
                    expect(
                        await erc1410Facet.balanceOf(signer_C.address)
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.balanceOf(signer_D.address)
                    ).to.be.equal(amount / 2)
                    expect(await erc1410Facet.totalSupply()).to.be.equal(amount)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            DEFAULT_PARTITION,
                            signer_C.address
                        )
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            DEFAULT_PARTITION,
                            signer_D.address
                        )
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.totalSupplyByPartition(
                            DEFAULT_PARTITION
                        )
                    ).to.be.equal(amount)
                }
            )
        })

        describe('transferFrom', () => {
            beforeEach(async () => {
                await erc20SignerC.approve(signer_D.address, amount)
            })

            it('GIVEN a non kyc account THEN transferFrom fails with InvalidKycStatus', async () => {
                await kycFacet.revokeKyc(signer_C.address)
                // non kyc'd sender
                await expect(
                    erc20Facet
                        .connect(signer_A)
                        .transferFrom(
                            signer_D.address,
                            signer_C.address,
                            amount / 2
                        )
                ).to.revertedWithCustomError(kycFacet, 'InvalidKycStatus')

                // non kyc'd receiver
                await expect(
                    erc20Facet
                        .connect(signer_A)
                        .transferFrom(
                            signer_C.address,
                            signer_D.address,
                            amount / 2
                        )
                ).to.revertedWithCustomError(kycFacet, 'InvalidKycStatus')
            })

            it(
                'GIVEN an account with allowance ' +
                    'WHEN transferFrom to another whitelisted account ' +
                    'THEN emits Transfer event and balances are updated',
                async () => {
                    expect(
                        await erc20SignerE.transferFrom(
                            signer_C.address,
                            signer_D.address,
                            amount / 2
                        )
                    )
                        .to.emit(erc20SignerC, 'Transfer')
                        .withArgs(signer_C.address, signer_D.address, amount)
                    expect(
                        await erc1410Facet.balanceOf(signer_C.address)
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.balanceOf(signer_D.address)
                    ).to.be.equal(amount / 2)
                    expect(await erc1410Facet.totalSupply()).to.be.equal(amount)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            DEFAULT_PARTITION,
                            signer_C.address
                        )
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.balanceOfByPartition(
                            DEFAULT_PARTITION,
                            signer_D.address
                        )
                    ).to.be.equal(amount / 2)
                    expect(
                        await erc1410Facet.totalSupplyByPartition(
                            DEFAULT_PARTITION
                        )
                    ).to.be.equal(amount)
                }
            )
        })

        it('GIVEN a paused ERC20 WHEN running any state changing method THEN transaction fails with TokenIsPaused', async () => {
            await pauseFacet.pause()

            await expect(
                erc20Facet.approve(signer_D.address, amount)
            ).to.be.rejectedWith('TokenIsPaused')

            await expect(
                erc20Facet.transfer(signer_D.address, amount)
            ).to.be.rejectedWith('TokenIsPaused')

            await expect(
                erc20Facet.transferFrom(
                    signer_C.address,
                    signer_D.address,
                    amount
                )
            ).to.be.rejectedWith('TokenIsPaused')

            await expect(
                erc20Facet.increaseAllowance(signer_C.address, amount)
            ).to.be.rejectedWith('TokenIsPaused')

            await expect(
                erc20Facet.decreaseAllowance(signer_C.address, amount)
            ).to.be.rejectedWith('TokenIsPaused')
        })

        it('GIVEN an ERC20 with clearing active WHEN transfer THEN transaction fails with ClearingIsActivated', async () => {
            await clearingActionsFacet.activateClearing()
            const clearingInterface = await ethers.getContractAt(
                'IClearing',
                diamond.address
            )
            await expect(
                erc20Facet.transfer(signer_D.address, amount)
            ).to.be.revertedWithCustomError(
                clearingInterface,
                'ClearingIsActivated'
            )

            await expect(
                erc20Facet.transferFrom(
                    signer_C.address,
                    signer_D.address,
                    amount
                )
            ).to.be.revertedWithCustomError(
                clearingInterface,
                'ClearingIsActivated'
            )
        })

        it('GIVEN a initializer ERC20 WHEN try to use a non authorized account THEN transaction fails with AccountIsBlocked', async () => {
            await controlListFacet.addToControlList(signer_D.address)
            await expect(
                erc20FacetBlackList.approve(signer_A.address, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.approve(signer_D.address, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20FacetBlackList.transfer(signer_A.address, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.transfer(signer_D.address, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await kycFacet.grantKyc(
                signer_A.address,
                EMPTY_VC_ID,
                ZERO,
                MAX_UINT256,
                signer_D.address
            )
            await kycFacet.grantKyc(
                signer_B.address,
                EMPTY_VC_ID,
                ZERO,
                MAX_UINT256,
                signer_D.address
            )

            await expect(
                erc20FacetBlackList.transferFrom(
                    signer_A.address,
                    signer_B.address,
                    amount
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.transferFrom(
                    signer_D.address,
                    signer_C.address,
                    amount
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.transferFrom(
                    signer_C.address,
                    signer_D.address,
                    amount
                )
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20FacetBlackList.increaseAllowance(signer_A.address, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.increaseAllowance(signer_D.address, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20FacetBlackList.decreaseAllowance(signer_A.address, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
            await expect(
                erc20Facet.decreaseAllowance(signer_D.address, amount)
            ).to.be.rejectedWith('AccountIsBlocked')
        })
    })
})
