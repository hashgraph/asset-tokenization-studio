import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
    BusinessLogicResolver,
    TREXFactoryAts,
    ITREXFactory,
    AccessControl,
    ERC20,
    Factory,
} from '@contract-types'

import { deployFullSuiteFixture } from './fixtures/deploy-full-suite.fixture'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployAtsInfrastructureFixture } from '@test'
import {
    ADDRESS_ZERO,
    EQUITY_CONFIG_ID,
    BOND_CONFIG_ID,
    ATS_ROLES,
} from '@scripts'
import { Rbac } from '@scripts/domain'
import { getSecurityData, getRegulationData } from '@test'
import { getEquityDetails } from '@test'
import { getBondDetails } from '@test'

describe('TREX Factory Tests', () => {
    let deployer: SignerWithAddress

    let init_rbacs: Rbac[] = []

    const name = 'ATS-TREX-Token'
    const symbol = 'ATS-TREX'
    const decimals = 6

    let businessLogicResolver: BusinessLogicResolver
    let factoryAts: TREXFactoryAts
    const tokenDetails: ITREXFactory.TokenDetailsStruct =
        {} as ITREXFactory.TokenDetailsStruct
    const claimDetails: ITREXFactory.ClaimDetailsStruct =
        {} as ITREXFactory.ClaimDetailsStruct
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let trexDeployment: any

    let accessControlFacet: AccessControl
    let erc20Facet: ERC20
    let factory: Factory

    async function setFacets(diamond: string) {
        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond
        )

        erc20Facet = await ethers.getContractAt('ERC20', diamond)
    }
    async function deployAtsFactoryFixture() {
        const base = await deployAtsInfrastructureFixture()
        factory = base.factory
        deployer = base.deployer
        businessLogicResolver = base.blr

        init_rbacs = [
            {
                role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
                members: [deployer.address],
            },
        ]
    }

    async function deployTrexSuiteFixture() {
        trexDeployment = await deployFullSuiteFixture()

        const trexBondDeploymentLib = await (
            await ethers.getContractFactory('TREXBondDeploymentLib')
        ).deploy()
        await trexBondDeploymentLib.deployed()
        const trexEquityDeploymentLib = await (
            await ethers.getContractFactory('TREXEquityDeploymentLib')
        ).deploy()
        await trexEquityDeploymentLib.deployed()

        factoryAts = await (
            await ethers.getContractFactory('TREXFactoryAts', {
                signer: deployer,
                libraries: {
                    TREXBondDeploymentLib: trexBondDeploymentLib.address,
                    TREXEquityDeploymentLib: trexEquityDeploymentLib.address,
                },
            })
        ).deploy(
            trexDeployment.authorities.trexImplementationAuthority.address,
            trexDeployment.factories.identityFactory.address,
            factory.address,
            {}
        )
        await factoryAts.deployed()

        await trexDeployment.factories.identityFactory
            .connect(deployer)
            .addTokenFactory(factoryAts.address)

        tokenDetails.name = name
        tokenDetails.symbol = symbol
        tokenDetails.decimals = decimals
        tokenDetails.ONCHAINID = ADDRESS_ZERO
        tokenDetails.owner = deployer.address
        tokenDetails.irAgents = [deployer.address]
        tokenDetails.irs = ADDRESS_ZERO
        tokenDetails.tokenAgents = [deployer.address]
        tokenDetails.complianceModules = []
        tokenDetails.complianceSettings = []

        claimDetails.claimTopics = []
        claimDetails.issuerClaims = []
        claimDetails.issuers = []
    }

    beforeEach(async () => {
        await loadFixture(deployAtsFactoryFixture)
        await loadFixture(deployTrexSuiteFixture)
    })

    describe('Equity tests', () => {
        it('GIVEN a consumed salt WHEN reusing it THEN transaction reverts with token already deployed', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()
            await factoryAts
                .connect(deployer)
                .deployTREXSuiteAtsEquity(
                    'salt-equity',
                    tokenDetails,
                    claimDetails,
                    equityData,
                    factoryRegulationData
                )
            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsEquity(
                        'salt-equity',
                        tokenDetails,
                        claimDetails,
                        equityData,
                        factoryRegulationData
                    )
            ).to.revertedWith('token already deployed')
        })

        it('GIVEN an invalid claim pattern THEN transaction reverts with claim pattern not valid', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            claimDetails.issuers = [ethers.Wallet.createRandom().address]

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsEquity(
                        'salt-equity',
                        tokenDetails,
                        claimDetails,
                        equityData,
                        factoryRegulationData
                    )
            ).to.revertedWith('claim pattern not valid')
        })

        it('GIVEN max claim issuers exceeded THEN transaction reverts with max 5 claim issuers at deployment', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            claimDetails.issuers = Array.from(
                { length: 6 },
                () => ethers.Wallet.createRandom().address
            )
            claimDetails.issuerClaims = Array.from({ length: 6 }, () => [
                Math.floor(Math.random() * 10),
            ])

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsEquity(
                        'salt-equity',
                        tokenDetails,
                        claimDetails,
                        equityData,
                        factoryRegulationData
                    )
            ).to.revertedWith('max 5 claim issuers at deployment')
        })

        it('GIVEN max claim topics exceeded THEN transaction reverts with max 5 claim topics at deployment', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            claimDetails.claimTopics = Array.from({ length: 6 }, () =>
                Math.floor(Math.random() * 10)
            )

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsEquity(
                        'salt-equity',
                        tokenDetails,
                        claimDetails,
                        equityData,
                        factoryRegulationData
                    )
            ).to.revertedWith('max 5 claim topics at deployment')
        })

        it('GIVEN max ir agents exceeded THEN transaction reverts with max 5 agents at deployment', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            tokenDetails.irAgents = Array.from(
                { length: 6 },
                () => ethers.Wallet.createRandom().address
            )

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsEquity(
                        'salt-equity',
                        tokenDetails,
                        claimDetails,
                        equityData,
                        factoryRegulationData
                    )
            ).to.revertedWith('max 5 agents at deployment')
        })

        it('GIVEN max token agents exceeded THEN transaction reverts with max 5 agents at deployment', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            tokenDetails.tokenAgents = Array.from(
                { length: 6 },
                () => ethers.Wallet.createRandom().address
            )

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsEquity(
                        'salt-equity',
                        tokenDetails,
                        claimDetails,
                        equityData,
                        factoryRegulationData
                    )
            ).to.revertedWith('max 5 agents at deployment')
        })

        it('GIVEN max token agents exceeded THEN transaction reverts with max 5 agents at deployment', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            tokenDetails.tokenAgents = Array.from(
                { length: 6 },
                () => ethers.Wallet.createRandom().address
            )

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsEquity(
                        'salt-equity',
                        tokenDetails,
                        claimDetails,
                        equityData,
                        factoryRegulationData
                    )
            ).to.revertedWith('max 5 agents at deployment')
        })

        it('GIVEN max modules actions exceeded THEN transaction reverts with max 30 module actions at deployment', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            tokenDetails.complianceModules = Array.from(
                { length: 31 },
                () => ethers.Wallet.createRandom().address
            )

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsEquity(
                        'salt-equity',
                        tokenDetails,
                        claimDetails,
                        equityData,
                        factoryRegulationData
                    )
            ).to.be.revertedWith('max 30 module actions at deployment')
        })

        it('GIVEN correct data WHEN deploying equity THEN deployment succeeds and events are emitted', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver, {
                    rbacs: init_rbacs,
                }),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            const deploymentResult = await factoryAts
                .connect(deployer)
                .deployTREXSuiteAtsEquity(
                    'salt-equity',
                    tokenDetails,
                    claimDetails,
                    equityData,
                    factoryRegulationData
                )

            const deploymentReceipt = await deploymentResult.wait()

            const trexSuiteDeployedEvent = deploymentReceipt.events?.find(
                (event) => event.event === 'TREXSuiteDeployed'
            )
            expect(trexSuiteDeployedEvent).to.not.be.undefined

            const [trexAddr] = trexSuiteDeployedEvent?.args || []

            await setFacets(trexAddr)

            expect(await erc20Facet.name()).to.equal(
                equityData.security.erc20MetadataInfo.name
            )
            expect(await erc20Facet.symbol()).to.equal(
                equityData.security.erc20MetadataInfo.symbol
            )
            expect(await erc20Facet.decimals()).to.equal(
                equityData.security.erc20MetadataInfo.decimals
            )
            expect(
                await accessControlFacet.hasRole(
                    ATS_ROLES._TREX_OWNER_ROLE,
                    deployer.address
                )
            ).to.be.true
            expect(
                await accessControlFacet.hasRole(
                    ATS_ROLES._DEFAULT_ADMIN_ROLE,
                    deployer.address
                )
            ).to.be.true
        })

        it('GIVEN correct data WHEN fetching deployed suite by salt THEN suite details are returned', async () => {
            const equityData = {
                security: getSecurityData(businessLogicResolver),
                equityDetails: getEquityDetails(),
            }
            equityData.security.resolverProxyConfiguration = {
                key: EQUITY_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            await factoryAts
                .connect(deployer)
                .deployTREXSuiteAtsEquity(
                    'salt-equity',
                    tokenDetails,
                    claimDetails,
                    equityData,
                    factoryRegulationData
                )

            const suiteDetails = await factoryAts.getToken('salt-equity')
            expect(suiteDetails).to.not.equal(ADDRESS_ZERO)
        })
    })

    describe('Bond tests', () => {
        it('GIVEN a consumed salt WHEN reusing it THEN transaction reverts with token already deployed', async () => {
            const bondData = {
                security: getSecurityData(businessLogicResolver),
                bondDetails: await getBondDetails(),
                proceedRecipients: [],
                proceedRecipientsData: [],
            }
            bondData.security.resolverProxyConfiguration = {
                key: BOND_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            await factoryAts
                .connect(deployer)
                .deployTREXSuiteAtsBond(
                    'salt-bond',
                    tokenDetails,
                    claimDetails,
                    bondData,
                    factoryRegulationData
                )
            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsBond(
                        'salt-bond',
                        tokenDetails,
                        claimDetails,
                        bondData,
                        factoryRegulationData
                    )
            ).to.revertedWith('token already deployed')
        })

        it('GIVEN an invalid claim pattern THEN transaction reverts with claim pattern not valid', async () => {
            const bondData = {
                security: getSecurityData(businessLogicResolver),
                bondDetails: await getBondDetails(),
                proceedRecipients: [],
                proceedRecipientsData: [],
            }
            bondData.security.resolverProxyConfiguration = {
                key: BOND_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            claimDetails.issuers = [await ethers.Wallet.createRandom().address]

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsBond(
                        'salt-bond',
                        tokenDetails,
                        claimDetails,
                        bondData,
                        factoryRegulationData
                    )
            ).to.revertedWith('claim pattern not valid')
        })

        it('GIVEN max claim issuers exceeded THEN transaction reverts with max 5 claim issuers at deployment', async () => {
            const bondData = {
                security: getSecurityData(businessLogicResolver),
                bondDetails: await getBondDetails(),
                proceedRecipients: [],
                proceedRecipientsData: [],
            }
            bondData.security.resolverProxyConfiguration = {
                key: BOND_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            claimDetails.issuers = Array.from(
                { length: 6 },
                () => ethers.Wallet.createRandom().address
            )
            claimDetails.issuerClaims = Array.from({ length: 6 }, () => [
                Math.floor(Math.random() * 10),
            ])

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsBond(
                        'salt-bond',
                        tokenDetails,
                        claimDetails,
                        bondData,
                        factoryRegulationData
                    )
            ).to.revertedWith('max 5 claim issuers at deployment')
        })

        it('GIVEN max claim topics exceeded THEN transaction reverts with max 5 claim topics at deployment', async () => {
            const bondData = {
                security: getSecurityData(businessLogicResolver),
                bondDetails: await getBondDetails(),
                proceedRecipients: [],
                proceedRecipientsData: [],
            }
            bondData.security.resolverProxyConfiguration = {
                key: BOND_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            claimDetails.claimTopics = Array.from({ length: 6 }, () =>
                Math.floor(Math.random() * 10)
            )

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsBond(
                        'salt-bond',
                        tokenDetails,
                        claimDetails,
                        bondData,
                        factoryRegulationData
                    )
            ).to.revertedWith('max 5 claim topics at deployment')
        })

        it('GIVEN max ir agents exceeded THEN transaction reverts with max 5 agents at deployment', async () => {
            const bondData = {
                security: getSecurityData(businessLogicResolver),
                bondDetails: await getBondDetails(),
                proceedRecipients: [],
                proceedRecipientsData: [],
            }
            bondData.security.resolverProxyConfiguration = {
                key: BOND_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            tokenDetails.irAgents = Array.from(
                { length: 6 },
                () => ethers.Wallet.createRandom().address
            )

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsBond(
                        'salt-bond',
                        tokenDetails,
                        claimDetails,
                        bondData,
                        factoryRegulationData
                    )
            ).to.revertedWith('max 5 agents at deployment')
        })

        it('GIVEN max token agents exceeded THEN transaction reverts with max 5 agents at deployment', async () => {
            const bondData = {
                security: getSecurityData(businessLogicResolver),
                bondDetails: await getBondDetails(),
                proceedRecipients: [],
                proceedRecipientsData: [],
            }
            bondData.security.resolverProxyConfiguration = {
                key: BOND_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            tokenDetails.tokenAgents = Array.from(
                { length: 6 },
                () => ethers.Wallet.createRandom().address
            )

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsBond(
                        'salt-bond',
                        tokenDetails,
                        claimDetails,
                        bondData,
                        factoryRegulationData
                    )
            ).to.revertedWith('max 5 agents at deployment')
        })

        it('GIVEN max modules actions exceeded THEN transaction reverts with max 30 module actions at deployment', async () => {
            const bondData = {
                security: getSecurityData(businessLogicResolver),
                bondDetails: await getBondDetails(),
                proceedRecipients: [],
                proceedRecipientsData: [],
            }
            bondData.security.resolverProxyConfiguration = {
                key: BOND_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            tokenDetails.complianceModules = Array.from(
                { length: 31 },
                () => ethers.Wallet.createRandom().address
            )

            await expect(
                factoryAts
                    .connect(deployer)
                    .deployTREXSuiteAtsBond(
                        'salt-bond',
                        tokenDetails,
                        claimDetails,
                        bondData,
                        factoryRegulationData
                    )
            ).to.be.revertedWith('max 30 module actions at deployment')
        })

        it('GIVEN correct data WHEN deploying bond THEN deployment succeeds and events are emitted', async () => {
            const bondData = {
                security: getSecurityData(businessLogicResolver, {
                    rbacs: init_rbacs,
                }),
                bondDetails: await getBondDetails(),
                proceedRecipients: [],
                proceedRecipientsData: [],
            }
            bondData.security.resolverProxyConfiguration = {
                key: BOND_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            const deploymentResult = await factoryAts
                .connect(deployer)
                .deployTREXSuiteAtsBond(
                    'salt-bond',
                    tokenDetails,
                    claimDetails,
                    bondData,
                    factoryRegulationData
                )

            const deploymentReceipt = await deploymentResult.wait()

            const trexSuiteDeployedEvent = deploymentReceipt.events?.find(
                (event) => event.event === 'TREXSuiteDeployed'
            )
            expect(trexSuiteDeployedEvent).to.not.be.undefined

            const [trexAddr] = trexSuiteDeployedEvent?.args || []

            await setFacets(trexAddr)

            expect(await erc20Facet.name()).to.equal(
                bondData.security.erc20MetadataInfo.name
            )
            expect(await erc20Facet.symbol()).to.equal(
                bondData.security.erc20MetadataInfo.symbol
            )
            expect(await erc20Facet.decimals()).to.equal(
                bondData.security.erc20MetadataInfo.decimals
            )
            expect(
                await accessControlFacet.hasRole(
                    ATS_ROLES._TREX_OWNER_ROLE,
                    deployer.address
                )
            ).to.be.true
            expect(
                await accessControlFacet.hasRole(
                    ATS_ROLES._DEFAULT_ADMIN_ROLE,
                    deployer.address
                )
            ).to.be.true
        })

        it('GIVEN correct data WHEN fetching deployed suite by salt THEN suite details are returned', async () => {
            const bondData = {
                security: getSecurityData(businessLogicResolver),
                bondDetails: await getBondDetails(),
                proceedRecipients: [],
                proceedRecipientsData: [],
            }
            bondData.security.resolverProxyConfiguration = {
                key: BOND_CONFIG_ID,
                version: 1,
            }

            const factoryRegulationData = getRegulationData()

            await factoryAts
                .connect(deployer)
                .deployTREXSuiteAtsBond(
                    'salt-bond',
                    tokenDetails,
                    claimDetails,
                    bondData,
                    factoryRegulationData
                )

            const suiteDetails = await factoryAts.getToken('salt-bond')
            expect(suiteDetails).to.not.equal(ADDRESS_ZERO)
        })
    })
})
