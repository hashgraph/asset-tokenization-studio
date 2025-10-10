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
} from '../../../scripts'
import {
    AccessControlFacet__factory,
    PauseFacet__factory,
    KycFacet__factory,
    ControlListFacet__factory,
} from '@typechain'
import { isinGenerator } from '@thomaschaplin/isin-generator'

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
    dividendRight: 1,
    currency: CURRENCIES.USD,
    numberOfShares: ethers.constants.MaxUint256,
    nominalValue: 100,
    regulationType: RegulationType.REG_S,
    regulationSubType: RegulationSubType.NONE,
    countriesControlListType: true,
    listOfCountries: 'US,GB,CH',
    info: 'Test token for unit tests',
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
export async function deployEquityTokenFixture(tokenParams?: any) {
    const infrastructure = await loadFixture(deployAtsInfrastructureFixture)
    const { factory, blr, deployer } = infrastructure

    // Deploy equity token using factory helper
    const diamond = await deployEquityFromFactory({
        adminAccount: deployer.address,
        isin: isinGenerator(),
        factory: factory,
        businessLogicResolver: blr.address,
        ...DEFAULT_EQUITY_PARAMS,
        ...tokenParams,
    })

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

/**
 * Fixture: Deploy equity with multi-partition enabled
 *
 * Useful for testing partition-based operations (ERC1410, protected partitions).
 *
 * @param tokenParams - Optional custom token parameters
 * @returns Infrastructure + multi-partition equity token
 */
export async function deployEquityMultiPartitionFixture(tokenParams?: any) {
    return deployEquityTokenFixture({
        isMultiPartition: true,
        ...tokenParams,
    })
}

/**
 * Fixture: Deploy equity with protected partitions enabled
 *
 * Useful for testing protected partition restrictions.
 *
 * @param tokenParams - Optional custom token parameters
 * @returns Infrastructure + protected partitions equity token
 */
export async function deployEquityProtectedPartitionsFixture(
    tokenParams?: any
) {
    return deployEquityTokenFixture({
        isMultiPartition: true,
        arePartitionsProtected: true,
        ...tokenParams,
    })
}

/**
 * Fixture: Deploy equity with clearing enabled
 *
 * Useful for testing clearing and hold operations.
 *
 * @param tokenParams - Optional custom token parameters
 * @returns Infrastructure + clearing-enabled equity token
 */
export async function deployEquityClearingFixture(tokenParams?: any) {
    return deployEquityTokenFixture({
        clearingActive: true,
        ...tokenParams,
    })
}
