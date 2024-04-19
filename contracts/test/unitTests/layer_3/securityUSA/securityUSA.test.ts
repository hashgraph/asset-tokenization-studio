import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type EquityUSA,
    type BondUSA,
} from '../../../../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { deployEnvironment } from '../../../../scripts/deployEnvironmentByRpc'
import {
    Rbac,
    deployBondFromFactory,
    deployEquityFromFactory,
    RegulationType,
    RegulationSubType,
} from '../../../../scripts/factory'
import { time } from '@nomicfoundation/hardhat-network-helpers'

const countriesControlListType = true
const listOfCountries = 'ES,FR,CH'
const info = 'info'
const init_rbacs: Rbac[] = []

const TIME = 30
const numberOfUnits = 1000
let currentTimeInSeconds = 0
let startingDate = 0
const numberOfCoupons = 50
const frequency = 7
const rate = 1
let maturityDate = startingDate + numberOfCoupons * frequency
let firstCouponDate = startingDate + 1

describe('Security USA Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress

    let account_A: string

    let equityUSAFacet: EquityUSA
    let bondUSAFacet: BondUSA

    before(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B] = await ethers.getSigners()
        account_A = signer_A.address

        currentTimeInSeconds = await time.latest()
        startingDate = currentTimeInSeconds + TIME
        maturityDate = startingDate + numberOfCoupons * frequency
        firstCouponDate = startingDate + 1
    })

    beforeEach(async () => {
        await deployEnvironment()
    })

    describe('equity USA', () => {
        it('Given regulation type REG_S and subtype NONE WHEN Read regulation data from Equity USA THEN all ok', async () => {
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
                countriesControlListType,
                listOfCountries,
                info,
                init_rbacs
            )

            equityUSAFacet = await ethers.getContractAt(
                'EquityUSA',
                diamond.address
            )
            // Using account C (non role)
            equityUSAFacet = equityUSAFacet.connect(signer_B)

            // retrieve security regulation data
            const regulation = await equityUSAFacet.getSecurityRegulationData()

            expect(regulation.regulationData.regulationType).to.equal(
                RegulationType.REG_S
            )
            expect(regulation.regulationData.regulationSubType).to.equal(
                RegulationSubType.NONE
            )
            expect(regulation.regulationData.dealSize.toString()).to.equal('0')
            expect(
                regulation.regulationData.accreditedInvestors.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.maxNonAccreditedInvestors.toString()
            ).to.equal('0')
            expect(
                regulation.regulationData.manualInvestorVerification.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.internationalInvestors.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.resaleHoldPeriod.toString()
            ).to.equal('0')

            expect(
                regulation.additionalSecurityData.countriesControlListType
            ).to.equal(countriesControlListType)
            expect(regulation.additionalSecurityData.listOfCountries).to.equal(
                listOfCountries
            )
            expect(regulation.additionalSecurityData.info).to.equal(info)
        })

        it('Given regulation type REG_D and subtype REG_D_506_B WHEN Read regulation data from Equity USA THEN all ok', async () => {
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

            equityUSAFacet = await ethers.getContractAt(
                'EquityUSA',
                diamond.address
            )
            // Using account C (non role)
            equityUSAFacet = equityUSAFacet.connect(signer_B)

            // retrieve security regulation data
            const regulation = await equityUSAFacet.getSecurityRegulationData()

            expect(regulation.regulationData.regulationType).to.equal(
                RegulationType.REG_D
            )
            expect(regulation.regulationData.regulationSubType).to.equal(
                RegulationSubType.REG_D_506_B
            )
            expect(regulation.regulationData.dealSize.toString()).to.equal('0')
            expect(
                regulation.regulationData.accreditedInvestors.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.maxNonAccreditedInvestors.toString()
            ).to.equal('35')
            expect(
                regulation.regulationData.manualInvestorVerification.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.internationalInvestors.toString()
            ).to.equal('0')
            expect(
                regulation.regulationData.resaleHoldPeriod.toString()
            ).to.equal('1')

            expect(
                regulation.additionalSecurityData.countriesControlListType
            ).to.equal(countriesControlListType)
            expect(regulation.additionalSecurityData.listOfCountries).to.equal(
                listOfCountries
            )
            expect(regulation.additionalSecurityData.info).to.equal(info)
        })

        it('Given regulation type REG_D and subtype REG_D_506_C WHEN Read regulation data from Equity USA THEN all ok', async () => {
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
                RegulationSubType.REG_D_506_C,
                countriesControlListType,
                listOfCountries,
                info,
                init_rbacs
            )

            equityUSAFacet = await ethers.getContractAt(
                'EquityUSA',
                diamond.address
            )
            // Using account C (non role)
            equityUSAFacet = equityUSAFacet.connect(signer_B)

            // retrieve security regulation data
            const regulation = await equityUSAFacet.getSecurityRegulationData()

            expect(regulation.regulationData.regulationType).to.equal(
                RegulationType.REG_D
            )
            expect(regulation.regulationData.regulationSubType).to.equal(
                RegulationSubType.REG_D_506_C
            )
            expect(regulation.regulationData.dealSize.toString()).to.equal('0')
            expect(
                regulation.regulationData.accreditedInvestors.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.maxNonAccreditedInvestors.toString()
            ).to.equal('0')
            expect(
                regulation.regulationData.manualInvestorVerification.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.internationalInvestors.toString()
            ).to.equal('0')
            expect(
                regulation.regulationData.resaleHoldPeriod.toString()
            ).to.equal('1')

            expect(
                regulation.additionalSecurityData.countriesControlListType
            ).to.equal(countriesControlListType)
            expect(regulation.additionalSecurityData.listOfCountries).to.equal(
                listOfCountries
            )
            expect(regulation.additionalSecurityData.info).to.equal(info)
        })
    })

    describe('bond USA', () => {
        it('Given regulation type REG_S and subtype NONE WHEN Read regulation data from Bond USA THEN all ok', async () => {
            diamond = await deployBondFromFactory(
                account_A,
                false,
                true,
                false,
                'TEST_AccessControl',
                'TAC',
                6,
                'ABCDEF123456',
                '0x455552',
                numberOfUnits,
                100,
                startingDate,
                maturityDate,
                frequency,
                rate,
                firstCouponDate,
                RegulationType.REG_S,
                RegulationSubType.NONE,
                countriesControlListType,
                listOfCountries,
                info,
                init_rbacs
            )

            bondUSAFacet = await ethers.getContractAt(
                'BondUSA',
                diamond.address
            )
            // Using account C (non role)
            bondUSAFacet = bondUSAFacet.connect(signer_B)

            // retrieve security regulation data
            const regulation = await bondUSAFacet.getSecurityRegulationData()

            expect(regulation.regulationData.regulationType).to.equal(
                RegulationType.REG_S
            )
            expect(regulation.regulationData.regulationSubType).to.equal(
                RegulationSubType.NONE
            )
            expect(regulation.regulationData.dealSize.toString()).to.equal('0')
            expect(
                regulation.regulationData.accreditedInvestors.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.maxNonAccreditedInvestors.toString()
            ).to.equal('0')
            expect(
                regulation.regulationData.manualInvestorVerification.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.internationalInvestors.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.resaleHoldPeriod.toString()
            ).to.equal('0')

            expect(
                regulation.additionalSecurityData.countriesControlListType
            ).to.equal(countriesControlListType)
            expect(regulation.additionalSecurityData.listOfCountries).to.equal(
                listOfCountries
            )
            expect(regulation.additionalSecurityData.info).to.equal(info)
        })

        it('Given regulation type REG_D and subtype REG_D_506_B WHEN Read regulation data from Bond USA THEN all ok', async () => {
            diamond = await deployBondFromFactory(
                account_A,
                false,
                true,
                false,
                'TEST_AccessControl',
                'TAC',
                6,
                'ABCDEF123456',
                '0x455552',
                numberOfUnits,
                100,
                startingDate,
                maturityDate,
                frequency,
                rate,
                firstCouponDate,
                RegulationType.REG_D,
                RegulationSubType.REG_D_506_B,
                countriesControlListType,
                listOfCountries,
                info,
                init_rbacs
            )

            bondUSAFacet = await ethers.getContractAt(
                'BondUSA',
                diamond.address
            )
            // Using account C (non role)
            bondUSAFacet = bondUSAFacet.connect(signer_B)

            // retrieve security regulation data
            const regulation = await bondUSAFacet.getSecurityRegulationData()

            expect(regulation.regulationData.regulationType).to.equal(
                RegulationType.REG_D
            )
            expect(regulation.regulationData.regulationSubType).to.equal(
                RegulationSubType.REG_D_506_B
            )
            expect(regulation.regulationData.dealSize.toString()).to.equal('0')
            expect(
                regulation.regulationData.accreditedInvestors.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.maxNonAccreditedInvestors.toString()
            ).to.equal('35')
            expect(
                regulation.regulationData.manualInvestorVerification.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.internationalInvestors.toString()
            ).to.equal('0')
            expect(
                regulation.regulationData.resaleHoldPeriod.toString()
            ).to.equal('1')

            expect(
                regulation.additionalSecurityData.countriesControlListType
            ).to.equal(countriesControlListType)
            expect(regulation.additionalSecurityData.listOfCountries).to.equal(
                listOfCountries
            )
            expect(regulation.additionalSecurityData.info).to.equal(info)
        })

        it('Given regulation type REG_D and subtype REG_D_506_C WHEN Read regulation data from Bond USA THEN all ok', async () => {
            diamond = await deployBondFromFactory(
                account_A,
                false,
                true,
                false,
                'TEST_AccessControl',
                'TAC',
                6,
                'ABCDEF123456',
                '0x455552',
                numberOfUnits,
                100,
                startingDate,
                maturityDate,
                frequency,
                rate,
                firstCouponDate,
                RegulationType.REG_D,
                RegulationSubType.REG_D_506_C,
                countriesControlListType,
                listOfCountries,
                info,
                init_rbacs
            )

            bondUSAFacet = await ethers.getContractAt(
                'BondUSA',
                diamond.address
            )
            // Using account C (non role)
            bondUSAFacet = bondUSAFacet.connect(signer_B)

            // retrieve security regulation data
            const regulation = await bondUSAFacet.getSecurityRegulationData()

            expect(regulation.regulationData.regulationType).to.equal(
                RegulationType.REG_D
            )
            expect(regulation.regulationData.regulationSubType).to.equal(
                RegulationSubType.REG_D_506_C
            )
            expect(regulation.regulationData.dealSize.toString()).to.equal('0')
            expect(
                regulation.regulationData.accreditedInvestors.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.maxNonAccreditedInvestors.toString()
            ).to.equal('0')
            expect(
                regulation.regulationData.manualInvestorVerification.toString()
            ).to.equal('1')
            expect(
                regulation.regulationData.internationalInvestors.toString()
            ).to.equal('0')
            expect(
                regulation.regulationData.resaleHoldPeriod.toString()
            ).to.equal('1')

            expect(
                regulation.additionalSecurityData.countriesControlListType
            ).to.equal(countriesControlListType)
            expect(regulation.additionalSecurityData.listOfCountries).to.equal(
                listOfCountries
            )
            expect(regulation.additionalSecurityData.info).to.equal(info)
        })
    })
})
