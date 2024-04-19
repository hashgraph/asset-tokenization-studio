import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type AccessControl,
    type ControlList,
    type ERC1644,
    type ERC20,
    type Factory,
} from '../../../typechain-types'
import { deployEnvironment } from '../../../scripts/deployEnvironmentByRpc'
import {
    Rbac,
    setEquityData,
    setBondData,
    DividendType,
    SecurityType,
    setFactoryRegulationData,
    RegulationType,
    RegulationSubType,
} from '../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    ADDRESS_0,
    _DEFAULT_ADMIN_ROLE,
    _CONTROL_LIST_ROLE,
    _CORPORATE_ACTION_ROLE,
    _ISSUER_ROLE,
    _DOCUMENTER_ROLE,
    _CONTROLLER_ROLE,
    _PAUSER_ROLE,
    _SNAPSHOT_ROLE,
    _LOCKER_ROLE,
    EquityDeployedEvent,
    BondDeployedEvent,
} from '../../../scripts/constants'
import { transparentUpgradableProxy } from '../../../scripts/transparentUpgradableProxy'

describe('Factory Tests', () => {
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let signer_D: SignerWithAddress
    let signer_E: SignerWithAddress
    let signer_F: SignerWithAddress
    let signer_G: SignerWithAddress
    let signer_H: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string
    let account_D: string
    let account_E: string
    let account_F: string
    let account_G: string
    let account_H: string

    const init_rbacs: Rbac[] = []

    const name = 'TEST_AccessControl'
    const symbol = 'TAC'
    const decimals = 6
    const isin = 'ABCDEF123456'
    const isWhitelist = false
    const isControllable = true
    const isMultiPartition = false

    const votingRight = true
    const informationRight = false
    const liquidationRight = true
    const subscriptionRight = false
    const convertionRight = true
    const redemptionRight = false
    const putRight = true
    const dividendRight = DividendType.PREFERRED
    const numberOfShares = 2000

    const currency = '0x455552'
    const numberOfUnits = 1000
    const nominalValue = 100
    let startingDate = 999
    let maturityDate = 999
    const couponFrequency = 1
    const couponRate = 1
    let firstCouponDate = 999
    const numberOfCoupon = 30

    const regulationType = RegulationType.REG_D
    const regulationSubType = RegulationSubType.REG_D_506_B
    const countriesControlListType = true
    const listOfCountries = 'ES,FR,CH'
    const info = 'info'

    let factory: Factory
    let accessControlFacet: AccessControl
    let controlListFacet: ControlList
    let erc1644Facet: ERC1644
    let erc20Facet: ERC20

    const listOfRoles = [
        _DEFAULT_ADMIN_ROLE,
        _CONTROL_LIST_ROLE,
        _CORPORATE_ACTION_ROLE,
        _ISSUER_ROLE,
        _DOCUMENTER_ROLE,
        _CONTROLLER_ROLE,
        _PAUSER_ROLE,
        _SNAPSHOT_ROLE,
        _LOCKER_ROLE,
    ]
    let listOfMembers: string[]

    async function readFacets(equityAddress: string) {
        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            equityAddress
        )

        controlListFacet = await ethers.getContractAt(
            'ControlList',
            equityAddress
        )

        erc1644Facet = await ethers.getContractAt('ERC1644', equityAddress)

        erc20Facet = await ethers.getContractAt('ERC20', equityAddress)
    }

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[
            signer_A,
            signer_B,
            signer_C,
            signer_D,
            signer_E,
            signer_F,
            signer_G,
            signer_H,
        ] = await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address
        account_C = signer_C.address
        account_D = signer_D.address
        account_E = signer_E.address
        account_F = signer_F.address
        account_G = signer_G.address
        account_H = signer_H.address

        listOfMembers = [
            account_A,
            account_B,
            account_C,
            account_D,
            account_E,
            account_F,
            account_G,
            account_H,
        ]

        await deployEnvironment()

        for (let i = 1; i < listOfMembers.length; i++) {
            const rbac: Rbac = {
                role: listOfRoles[i],
                members: [listOfMembers[i]],
            }
            init_rbacs.push(rbac)
        }

        factory = await ethers.getContractAt(
            'Factory',
            transparentUpgradableProxy.address
        )
    })

    describe('Equity tests', () => {
        it('GIVEN an empty Resolver WHEN deploying a new diamond THEN transaction fails', async () => {
            const equityData = await setEquityData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                votingRight,
                informationRight,
                liquidationRight,
                subscriptionRight,
                convertionRight,
                redemptionRight,
                putRight,
                dividendRight,
                currency,
                numberOfShares,
                nominalValue,
                init_rbacs,
                true,
                undefined,
                ADDRESS_0
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployEquity(equityData, factoryRegulationData)
            ).to.be.rejectedWith('EmptyResolver')
        })

        it('GIVEN a wrong ISIN WHEN deploying a new diamond THEN transaction fails', async () => {
            const equityData = await setEquityData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                '',
                votingRight,
                informationRight,
                liquidationRight,
                subscriptionRight,
                convertionRight,
                redemptionRight,
                putRight,
                dividendRight,
                currency,
                numberOfShares,
                nominalValue,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployEquity(equityData, factoryRegulationData)
            ).to.be.rejectedWith('WrongISIN')
        })

        it('GIVEN no admin WHEN deploying a new diamond THEN transaction fails', async () => {
            const equityData = await setEquityData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                votingRight,
                informationRight,
                liquidationRight,
                subscriptionRight,
                convertionRight,
                redemptionRight,
                putRight,
                dividendRight,
                currency,
                numberOfShares,
                nominalValue,
                init_rbacs,
                false,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployEquity(equityData, factoryRegulationData)
            ).to.be.rejectedWith('NoInitialAdmins')
        })

        it('GIVEN wrong regulation type WHEN deploying a new diamond THEN transaction fails', async () => {
            const equityData = await setEquityData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                votingRight,
                informationRight,
                liquidationRight,
                subscriptionRight,
                convertionRight,
                redemptionRight,
                putRight,
                dividendRight,
                currency,
                numberOfShares,
                nominalValue,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                RegulationType.NONE,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployEquity(equityData, factoryRegulationData)
            )
                .to.be.revertedWithCustomError(
                    factory,
                    'RegulationTypeAndSubTypeForbidden'
                )
                .withArgs(RegulationType.NONE, regulationSubType)
        })

        it('GIVEN wrong regulation type & subtype WHEN deploying a new diamond THEN transaction fails', async () => {
            const equityData = await setEquityData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                votingRight,
                informationRight,
                liquidationRight,
                subscriptionRight,
                convertionRight,
                redemptionRight,
                putRight,
                dividendRight,
                currency,
                numberOfShares,
                nominalValue,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                RegulationType.REG_D,
                RegulationSubType.NONE,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployEquity(equityData, factoryRegulationData)
            )
                .to.be.revertedWithCustomError(
                    factory,
                    'RegulationTypeAndSubTypeForbidden'
                )
                .withArgs(RegulationType.REG_D, RegulationSubType.NONE)
        })

        it('GIVEN the proper information WHEN deploying a new diamond THEN transaction succeeds', async () => {
            const equityData = await setEquityData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                votingRight,
                informationRight,
                liquidationRight,
                subscriptionRight,
                convertionRight,
                redemptionRight,
                putRight,
                dividendRight,
                currency,
                numberOfShares,
                nominalValue,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployEquity(equityData, factoryRegulationData)
            ).to.emit(factory, 'EquityDeployed')

            const result = await factory.deployEquity(
                equityData,
                factoryRegulationData
            )
            const events = (await result.wait()).events!
            const deployedEquityEvent = events.find(
                (e) => e.event == EquityDeployedEvent
            )
            const equityAddress = deployedEquityEvent!.args!.equityAddress

            await readFacets(equityAddress)

            for (let i = 0; i < listOfMembers.length; i++) {
                const roleMemberCount =
                    await accessControlFacet.getRoleMemberCount(listOfRoles[i])
                const roleMember = await accessControlFacet.getRoleMembers(
                    listOfRoles[i],
                    0,
                    1
                )
                expect(roleMemberCount).to.be.equal(1)
                expect(roleMember[0]).to.be.equal(listOfMembers[i])
            }

            const whiteList = await controlListFacet.getControlListType()
            expect(whiteList).to.be.equal(isWhitelist)

            const controllable = await erc1644Facet.isControllable()
            expect(controllable).to.be.equal(isControllable)

            const metadata = await erc20Facet.getERC20Metadata()
            expect(metadata.info.name).to.be.equal(name)
            expect(metadata.info.symbol).to.be.equal(symbol)
            expect(metadata.info.decimals).to.be.equal(decimals)
            expect(metadata.info.isin).to.be.equal(isin)
            expect(metadata.securityType).to.be.equal(SecurityType.EQUITY)

            const equityFacet = await ethers.getContractAt(
                'Equity',
                equityAddress
            )

            const equityMetadata = await equityFacet.getEquityDetails()
            expect(equityMetadata.votingRight).to.equal(votingRight)
            expect(equityMetadata.informationRight).to.equal(informationRight)
            expect(equityMetadata.liquidationRight).to.equal(liquidationRight)
            expect(equityMetadata.subscriptionRight).to.equal(subscriptionRight)
            expect(equityMetadata.convertionRight).to.equal(convertionRight)
            expect(equityMetadata.redemptionRight).to.equal(redemptionRight)
            expect(equityMetadata.putRight).to.equal(putRight)
            expect(equityMetadata.dividendRight).to.equal(dividendRight)
            expect(equityMetadata.currency).to.equal(currency)
            expect(equityMetadata.nominalValue).to.equal(nominalValue)

            const capFacet = await ethers.getContractAt('Cap', equityAddress)

            const maxSupply = await capFacet.getMaxSupply()
            expect(maxSupply).to.equal(numberOfShares)
        })
    })

    describe('Bond tests', () => {
        it('GIVEN an empty Resolver WHEN deploying a new diamond THEN transaction fails', async () => {
            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency,
                couponRate,
                firstCouponDate,
                init_rbacs,
                true,
                undefined,
                ADDRESS_0
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.be.rejectedWith('EmptyResolver')
        })

        it('GIVEN a wrong ISIN WHEN deploying a new diamond THEN transaction fails', async () => {
            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                '',
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency,
                couponRate,
                firstCouponDate,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.be.rejectedWith('WrongISIN')
        })

        it('GIVEN no admin WHEN deploying a new diamond THEN transaction fails', async () => {
            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency,
                couponRate,
                firstCouponDate,
                init_rbacs,
                false,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.be.rejectedWith('NoInitialAdmins')
        })

        it('GIVEN incorrect maturity or starting date WHEN deploying a new bond THEN transaction fails', async () => {
            maturityDate = startingDate - 365

            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency,
                couponRate,
                firstCouponDate,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.be.rejectedWith('WrongDates')

            const currentTimeInSeconds =
                Math.floor(new Date().getTime() / 1000) + 1
            bondData.bondDetails.startingDate = currentTimeInSeconds - 10000
            bondData.bondDetails.maturityDate =
                bondData.bondDetails.startingDate + 10
            bondData.couponDetails.firstCouponDate =
                bondData.bondDetails.startingDate + 1

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.be.rejectedWith('WrongTimestamp')
        })

        it('GIVEN incorrect first coupon date WHEN deploying a new bond THEN transaction fails', async () => {
            const currentTimeInSeconds =
                Math.floor(new Date().getTime() / 1000) + 1
            startingDate = currentTimeInSeconds + 10000
            maturityDate = startingDate + 10
            firstCouponDate = maturityDate + 1

            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency,
                couponRate,
                firstCouponDate,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.be.rejectedWith('CouponFirstDateWrong')

            bondData.couponDetails.firstCouponDate =
                bondData.bondDetails.startingDate - 1

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.be.rejectedWith('CouponFirstDateWrong')
        })

        it('GIVEN incorrect coupon frequency WHEN deploying a new bond THEN transaction fails', async () => {
            const currentTimeInSeconds =
                Math.floor(new Date().getTime() / 1000) + 1
            startingDate = currentTimeInSeconds + 10000
            maturityDate = startingDate + 30
            firstCouponDate = startingDate + 1
            const couponFrequency_2 = 0

            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency_2,
                couponRate,
                firstCouponDate,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.be.rejectedWith('CouponFrequencyWrong')
        })

        it('GIVEN the proper information WHEN deploying a new bond with fixed coupons THEN transaction succeeds', async () => {
            const currentTimeInSeconds =
                Math.floor(new Date().getTime() / 1000) + 1
            startingDate = currentTimeInSeconds + 10000
            maturityDate = startingDate + numberOfCoupon * couponFrequency
            firstCouponDate = startingDate + 1

            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency,
                couponRate,
                firstCouponDate,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                regulationType,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.emit(factory, 'BondDeployed')

            const result = await factory.deployBond(
                bondData,
                factoryRegulationData
            )
            const events = (await result.wait()).events!
            const deployedBondEvent = events.find(
                (e) => e.event == BondDeployedEvent
            )
            const bondAddress = deployedBondEvent!.args!.bondAddress

            await readFacets(bondAddress)

            for (let i = 0; i < listOfMembers.length; i++) {
                const roleMemberCount =
                    await accessControlFacet.getRoleMemberCount(listOfRoles[i])
                const roleMember = await accessControlFacet.getRoleMembers(
                    listOfRoles[i],
                    0,
                    1
                )
                expect(roleMemberCount).to.be.equal(1)
                expect(roleMember[0]).to.be.equal(listOfMembers[i])
            }

            const whiteList = await controlListFacet.getControlListType()
            expect(whiteList).to.be.equal(isWhitelist)

            const controllable = await erc1644Facet.isControllable()
            expect(controllable).to.be.equal(isControllable)

            const metadata = await erc20Facet.getERC20Metadata()
            expect(metadata.info.name).to.be.equal(name)
            expect(metadata.info.symbol).to.be.equal(symbol)
            expect(metadata.info.decimals).to.be.equal(decimals)
            expect(metadata.info.isin).to.be.equal(isin)
            expect(metadata.securityType).to.be.equal(SecurityType.BOND)

            const capFacet = await ethers.getContractAt('Cap', bondAddress)
            const maxSupply = await capFacet.getMaxSupply()
            expect(maxSupply).to.equal(numberOfUnits)

            const bondFacet = await ethers.getContractAt('Bond', bondAddress)
            const bondDetails = await bondFacet.getBondDetails()
            expect(bondDetails.currency).to.be.deep.equal(
                bondData.bondDetails.currency
            )
            expect(bondDetails.nominalValue).to.be.deep.equal(
                bondData.bondDetails.nominalValue
            )
            expect(bondDetails.startingDate).to.be.deep.equal(
                bondData.bondDetails.startingDate
            )
            expect(bondDetails.maturityDate).to.be.deep.equal(
                bondData.bondDetails.maturityDate
            )
            const couponDetails = await bondFacet.getCouponDetails()
            expect(couponDetails.couponFrequency).to.be.deep.equal(
                bondData.couponDetails.couponFrequency
            )
            expect(couponDetails.couponRate).to.be.deep.equal(
                bondData.couponDetails.couponRate
            )
            expect(couponDetails.firstCouponDate).to.be.deep.equal(
                bondData.couponDetails.firstCouponDate
            )

            const couponCount = await bondFacet.getCouponCount()
            expect(couponCount).to.equal(numberOfCoupon)
        })

        it('GIVEN wrong regulation type WHEN deploying a new diamond THEN transaction fails', async () => {
            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency,
                couponRate,
                firstCouponDate,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                RegulationType.NONE,
                regulationSubType,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(factory.deployBond(bondData, factoryRegulationData))
                .to.be.revertedWithCustomError(
                    factory,
                    'RegulationTypeAndSubTypeForbidden'
                )
                .withArgs(RegulationType.NONE, regulationSubType)
        })

        it('GIVEN wrong regulation type & subtype WHEN deploying a new diamond THEN transaction fails', async () => {
            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency,
                couponRate,
                firstCouponDate,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                RegulationType.REG_S,
                RegulationSubType.REG_D_506_C,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(factory.deployBond(bondData, factoryRegulationData))
                .to.be.revertedWithCustomError(
                    factory,
                    'RegulationTypeAndSubTypeForbidden'
                )
                .withArgs(RegulationType.REG_S, RegulationSubType.REG_D_506_C)
        })

        it('GIVEN the proper information WHEN deploying a new bond without fixed coupons THEN transaction succeeds', async () => {
            const currentTimeInSeconds =
                Math.floor(new Date().getTime() / 1000) + 1
            startingDate = currentTimeInSeconds + 10000
            maturityDate = startingDate + 30
            firstCouponDate = 0

            const bondData = await setBondData(
                account_A,
                isWhitelist,
                isControllable,
                isMultiPartition,
                name,
                symbol,
                decimals,
                isin,
                currency,
                numberOfUnits,
                nominalValue,
                startingDate,
                maturityDate,
                couponFrequency,
                couponRate,
                firstCouponDate,
                init_rbacs,
                true,
                undefined,
                undefined
            )

            const factoryRegulationData = await setFactoryRegulationData(
                RegulationType.REG_S,
                RegulationSubType.NONE,
                countriesControlListType,
                listOfCountries,
                info
            )

            await expect(
                factory.deployBond(bondData, factoryRegulationData)
            ).to.emit(factory, 'BondDeployed')

            const result = await factory.deployBond(
                bondData,
                factoryRegulationData
            )
            const events = (await result.wait()).events!
            const deployedBondEvent = events.find(
                (e) => e.event == BondDeployedEvent
            )
            const bondAddress = deployedBondEvent!.args!.bondAddress

            await readFacets(bondAddress)

            for (let i = 0; i < listOfMembers.length; i++) {
                const roleMemberCount =
                    await accessControlFacet.getRoleMemberCount(listOfRoles[i])
                const roleMember = await accessControlFacet.getRoleMembers(
                    listOfRoles[i],
                    0,
                    1
                )
                expect(roleMemberCount).to.be.equal(1)
                expect(roleMember[0]).to.be.equal(listOfMembers[i])
            }

            const whiteList = await controlListFacet.getControlListType()
            expect(whiteList).to.be.equal(isWhitelist)

            const controllable = await erc1644Facet.isControllable()
            expect(controllable).to.be.equal(isControllable)

            const metadata = await erc20Facet.getERC20Metadata()
            expect(metadata.info.name).to.be.equal(name)
            expect(metadata.info.symbol).to.be.equal(symbol)
            expect(metadata.info.decimals).to.be.equal(decimals)
            expect(metadata.info.isin).to.be.equal(isin)
            expect(metadata.securityType).to.be.equal(SecurityType.BOND)

            const capFacet = await ethers.getContractAt('Cap', bondAddress)
            const maxSupply = await capFacet.getMaxSupply()
            expect(maxSupply).to.equal(numberOfUnits)

            const bondFacet = await ethers.getContractAt('Bond', bondAddress)
            const bondDetails = await bondFacet.getBondDetails()
            expect(bondDetails.currency).to.be.deep.equal(
                bondData.bondDetails.currency
            )
            expect(bondDetails.nominalValue).to.be.deep.equal(
                bondData.bondDetails.nominalValue
            )
            expect(bondDetails.startingDate).to.be.deep.equal(
                bondData.bondDetails.startingDate
            )
            expect(bondDetails.maturityDate).to.be.deep.equal(
                bondData.bondDetails.maturityDate
            )
            const couponDetails = await bondFacet.getCouponDetails()
            expect(couponDetails.couponFrequency).to.be.deep.equal(
                bondData.couponDetails.couponFrequency
            )
            expect(couponDetails.couponRate).to.be.deep.equal(
                bondData.couponDetails.couponRate
            )
            expect(couponDetails.firstCouponDate).to.be.deep.equal(
                bondData.couponDetails.firstCouponDate
            )

            const couponCount = await bondFacet.getCouponCount()
            expect(couponCount).to.equal(0)
        })
    })
})
