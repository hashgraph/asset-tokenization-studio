import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { type BondUSAReadFacet } from '@typechain'
import { RegulationType, RegulationSubType, TIME_PERIODS_S } from '@scripts'
import { deployEquityTokenFixture } from '@test/fixtures'

const countriesControlListType = true
const listOfCountries = 'ES,FR,CH'
const info = 'info'

const TIME = 1000
let currentTimeInSeconds = 0
let startingDate = 0
const numberOfCoupons = 50
const frequency = TIME_PERIODS_S.DAY
let maturityDate = startingDate + numberOfCoupons * frequency

describe('Security USA Tests', () => {
    let signer_B: SignerWithAddress

    let bondUSAFacet: BondUSAReadFacet

    before(async () => {
        currentTimeInSeconds = (await ethers.provider.getBlock('latest'))
            .timestamp
        startingDate = currentTimeInSeconds + TIME
        maturityDate = startingDate + numberOfCoupons * frequency
        expect(startingDate).to.be.gt(currentTimeInSeconds)
        expect(maturityDate).to.be.gt(startingDate)
    })

    describe('equity USA', () => {
        it('Given regulation type REG_S and subtype NONE WHEN Read regulation data from Equity USA THEN all ok', async () => {
            const base = await deployEquityTokenFixture({
                regulationTypeParams: {
                    regulationType: RegulationType.REG_S,
                    regulationSubType: RegulationSubType.NONE,
                    additionalSecurityData: {
                        listOfCountries: listOfCountries,
                        info: info,
                    },
                },
            })
            const diamond = base.diamond
            signer_B = base.user2

            const equityUSAFacet = await ethers.getContractAt(
                'EquityUSA',
                diamond.address,
                signer_B
            )
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
            const base = await deployEquityTokenFixture({
                regulationTypeParams: {
                    regulationType: RegulationType.REG_D,
                    regulationSubType: RegulationSubType.REG_D_506_B,
                    additionalSecurityData: {
                        listOfCountries: listOfCountries,
                        info: info,
                    },
                },
            })

            const diamond = base.diamond
            signer_B = base.user2

            const equityUSAFacet = await ethers.getContractAt(
                'EquityUSA',
                diamond.address,
                signer_B
            )

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
            const base = await deployEquityTokenFixture({
                regulationTypeParams: {
                    regulationType: RegulationType.REG_D,
                    regulationSubType: RegulationSubType.REG_D_506_C,
                    additionalSecurityData: {
                        listOfCountries: listOfCountries,
                        info: info,
                    },
                },
            })
            const diamond = base.diamond
            signer_B = base.user2

            const equityUSAFacet = await ethers.getContractAt(
                'EquityUSA',
                diamond.address,
                signer_B
            )

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
            const base = await deployEquityTokenFixture({
                regulationTypeParams: {
                    regulationType: RegulationType.REG_S,
                    regulationSubType: RegulationSubType.NONE,
                    additionalSecurityData: {
                        listOfCountries: listOfCountries,
                        info: info,
                    },
                },
            })
            const diamond = base.diamond
            signer_B = base.user2

            bondUSAFacet = await ethers.getContractAt(
                'BondUSAReadFacet',
                diamond.address
            )

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
            const base = await deployEquityTokenFixture({
                regulationTypeParams: {
                    regulationType: RegulationType.REG_D,
                    regulationSubType: RegulationSubType.REG_D_506_B,
                    additionalSecurityData: {
                        listOfCountries: listOfCountries,
                        info: info,
                    },
                },
            })
            const diamond = base.diamond
            signer_B = base.user2

            bondUSAFacet = await ethers.getContractAt(
                'BondUSAReadFacet',
                diamond.address
            )
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
            const base = await deployEquityTokenFixture({
                regulationTypeParams: {
                    regulationType: RegulationType.REG_D,
                    regulationSubType: RegulationSubType.REG_D_506_C,
                    additionalSecurityData: {
                        listOfCountries: listOfCountries,
                        info: info,
                    },
                },
            })
            const diamond = base.diamond
            signer_B = base.user2

            bondUSAFacet = await ethers.getContractAt(
                'BondUSAReadFacet',
                diamond.address
            )
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
