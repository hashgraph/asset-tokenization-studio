// SPDX-License-Identifier: Apache-2.0

/**
 * Equity token test fixtures.
 *
 * Provides fixtures for deploying equity tokens with various configurations.
 * All fixtures extend the base ATS infrastructure fixture.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployAtsInfrastructureFixture } from '../infrastructure.fixture'
import {
    deployEquityFromFactory,
    RegulationType,
    RegulationSubType,
    CURRENCIES,
    DeployEquityFromFactoryParams,
    DeepPartial,
} from '../../../scripts'
import {
    AccessControlFacet__factory,
    PauseFacet__factory,
    KycFacet__factory,
    ControlListFacet__factory,
} from '@typechain'
import { isinGenerator } from '@thomaschaplin/isin-generator'
import {
    DividendRight,
    FactoryRegulationDataParams,
} from '@scripts/domain/factory/types'

/**
 * Default equity token parameters.
 * Override by passing custom params to fixture functions.
 */
export const DEFAULT_EQUITY_PARAMS = {
    isWhiteList: false,
    isControllable: true,
    arePartitionsProtected: false,
    clearingActive: false,
    internalKycActivated: true,
    erc20VotesActivated: false,
    isMultiPartition: false,
    name: 'TEST_Token',
    symbol: 'TEST',
    decimals: 6,
    votingRight: false,
    informationRight: false,
    liquidationRight: false,
    subscriptionRight: true,
    conversionRight: true,
    redemptionRight: true,
    putRight: false,
    dividendRight: DividendRight.PREFERRED,
    currency: CURRENCIES.USD,
    maxSupply: ethers.constants.MaxUint256,
    nominalValue: 100,
    regulationType: RegulationType.REG_S,
    regulationSubType: RegulationSubType.NONE,
    countriesControlListType: true,
    listOfCountries: 'US,GB,CH',
    info: 'Test token for unit tests',
    externalPauses: [],
    externalControlLists: [],
    externalKycLists: [],
} as const

/**
 * Fixture: Deploy ATS infrastructure + single Equity token
 *
 * Extends deployAtsInfrastructureFixture with a deployed equity token
 * using default parameters (single partition, controllable, internal KYC).
 *
 * @param tokenParams - Optional custom token parameters (merged with defaults)
 * @returns Infrastructure + deployed equity token + connected facets
 */
export async function deployEquityTokenFixture(
    equityDataParams?: DeepPartial<DeployEquityFromFactoryParams>,
    regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>
) {
    const infrastructure = await loadFixture(deployAtsInfrastructureFixture)
    const { factory, blr, deployer } = infrastructure
    const securityData = {
        arePartitionsProtected:
            equityDataParams?.securityData?.arePartitionsProtected ??
            DEFAULT_EQUITY_PARAMS.arePartitionsProtected,
        isMultiPartition:
            equityDataParams?.securityData?.isMultiPartition ??
            DEFAULT_EQUITY_PARAMS.isMultiPartition,
        businessLogicResolver: blr.address,
        isControllable:
            equityDataParams?.securityData?.isControllable ??
            DEFAULT_EQUITY_PARAMS.isControllable,
        isWhiteList:
            equityDataParams?.securityData?.isWhiteList ??
            DEFAULT_EQUITY_PARAMS.isWhiteList,
        maxSupply:
            equityDataParams?.securityData?.maxSupply ??
            DEFAULT_EQUITY_PARAMS.maxSupply,
        name:
            equityDataParams?.securityData?.name ?? DEFAULT_EQUITY_PARAMS.name,
        symbol:
            equityDataParams?.securityData?.symbol ??
            DEFAULT_EQUITY_PARAMS.symbol,
        decimals:
            equityDataParams?.securityData?.decimals ??
            DEFAULT_EQUITY_PARAMS.decimals,
        isin: equityDataParams?.securityData?.isin ?? isinGenerator(),
        clearingActive:
            equityDataParams?.securityData?.clearingActive ??
            DEFAULT_EQUITY_PARAMS.clearingActive,
        internalKycActivated:
            equityDataParams?.securityData?.internalKycActivated ??
            DEFAULT_EQUITY_PARAMS.internalKycActivated,
        externalPauses: [
            ...((equityDataParams?.securityData?.externalPauses as string[]) ??
                DEFAULT_EQUITY_PARAMS.externalPauses),
        ],
        externalControlLists: [
            ...((equityDataParams?.securityData
                ?.externalControlLists as string[]) ??
                DEFAULT_EQUITY_PARAMS.externalControlLists),
        ],
        externalKycLists: [
            ...((equityDataParams?.securityData
                ?.externalKycLists as string[]) ??
                DEFAULT_EQUITY_PARAMS.externalKycLists),
        ],
        erc20VotesActivated:
            equityDataParams?.securityData?.erc20VotesActivated ??
            DEFAULT_EQUITY_PARAMS.erc20VotesActivated,
        compliance: ethers.constants.AddressZero,
        identityRegistry: ethers.constants.AddressZero,
    }
    const equityDetails = {
        votingRight:
            equityDataParams?.equityDetails?.votingRight ??
            DEFAULT_EQUITY_PARAMS.votingRight,
        informationRight:
            equityDataParams?.equityDetails?.informationRight ??
            DEFAULT_EQUITY_PARAMS.informationRight,
        liquidationRight:
            equityDataParams?.equityDetails?.liquidationRight ??
            DEFAULT_EQUITY_PARAMS.liquidationRight,
        subscriptionRight:
            equityDataParams?.equityDetails?.subscriptionRight ??
            DEFAULT_EQUITY_PARAMS.subscriptionRight,
        conversionRight:
            equityDataParams?.equityDetails?.conversionRight ??
            DEFAULT_EQUITY_PARAMS.conversionRight,
        redemptionRight:
            equityDataParams?.equityDetails?.redemptionRight ??
            DEFAULT_EQUITY_PARAMS.redemptionRight,
        putRight:
            equityDataParams?.equityDetails?.putRight ??
            DEFAULT_EQUITY_PARAMS.putRight,
        dividendRight:
            equityDataParams?.equityDetails?.dividendRight ??
            DEFAULT_EQUITY_PARAMS.dividendRight,
        currency:
            equityDataParams?.equityDetails?.currency ??
            DEFAULT_EQUITY_PARAMS.currency,
        nominalValue:
            equityDataParams?.equityDetails?.nominalValue ??
            DEFAULT_EQUITY_PARAMS.nominalValue,
    }
    // Deploy equity token using factory helper
    const diamond = await deployEquityFromFactory(
        {
            adminAccount: deployer.address,
            factory,
            securityData,
            equityDetails,
        },
        {
            regulationType:
                regulationTypeParams?.regulationType ??
                DEFAULT_EQUITY_PARAMS.regulationType,
            regulationSubType:
                regulationTypeParams?.regulationSubType ??
                DEFAULT_EQUITY_PARAMS.regulationSubType,
            countriesControlListType:
                regulationTypeParams?.countriesControlListType ??
                DEFAULT_EQUITY_PARAMS.countriesControlListType,
            listOfCountries:
                regulationTypeParams?.listOfCountries ??
                DEFAULT_EQUITY_PARAMS.listOfCountries,
            info: regulationTypeParams?.info ?? DEFAULT_EQUITY_PARAMS.info,
        }
    )

    // Connect commonly used facets to diamond
    const accessControlFacet = AccessControlFacet__factory.connect(
        diamond.address,
        deployer
    )
    const pauseFacet = PauseFacet__factory.connect(diamond.address, deployer)
    const kycFacet = KycFacet__factory.connect(diamond.address, deployer)
    const controlListFacet = ControlListFacet__factory.connect(
        diamond.address,
        deployer
    )

    return {
        ...infrastructure,

        // Token
        diamond,
        tokenAddress: diamond.address,

        // Connected facets (most commonly used)
        accessControlFacet,
        pauseFacet,
        kycFacet,
        controlListFacet,
    }
}
