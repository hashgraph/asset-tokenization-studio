// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy security tokens using the Factory contract.
 *
 * This module provides functions to deploy equity and bond tokens through
 * the Factory contract, which handles diamond proxy creation and initialization.
 *
 * @module domain/factory/deployToken
 */

import { ethers } from 'ethers'
import type { IFactory, ResolverProxy } from '@typechain'
import { ResolverProxy__factory } from '@typechain'
import { GAS_LIMIT } from '@scripts/infrastructure'
import {
    RegulationType,
    RegulationSubType,
    EQUITY_CONFIG_ID,
} from '@scripts/domain'

// ============================================================================
// Types
// ============================================================================

/**
 * Parameters for deploying an equity token from the factory.
 */
export interface DeployEquityFromFactoryParams {
    /** Admin account address */
    adminAccount: string
    /** Enable whitelist mode */
    isWhiteList: boolean
    /** Enable controllable transfers */
    isControllable: boolean
    /** Protect partitions from unauthorized access */
    arePartitionsProtected?: boolean
    /** Enable clearing functionality */
    clearingActive?: boolean
    /** Activate internal KYC */
    internalKycActivated?: boolean
    /** Enable multi-partition support */
    isMultiPartition: boolean
    /** Token name */
    name: string
    /** Token symbol */
    symbol: string
    /** Token decimals */
    decimals: number
    /** ISIN identifier */
    isin: string
    /** Voting rights */
    votingRight: boolean
    /** Information rights */
    informationRight: boolean
    /** Liquidation rights */
    liquidationRight: boolean
    /** Subscription rights */
    subscriptionRight: boolean
    /** Conversion rights */
    conversionRight: boolean
    /** Redemption rights */
    redemptionRight: boolean
    /** Put rights */
    putRight: boolean
    /** Dividend type (0 = NONE, 1 = PREFERRED, 2 = COMMON) */
    dividendRight: number
    /** Currency code */
    currency: string
    /** Number of shares (max supply) */
    numberOfShares: ethers.BigNumberish
    /** Nominal value per share */
    nominalValue: number
    /** Regulation type */
    regulationType: RegulationType
    /** Regulation sub-type */
    regulationSubType: RegulationSubType
    /** Countries control list type (true = whitelist, false = blacklist) */
    countriesControlListType?: boolean
    /** Comma-separated country codes */
    listOfCountries?: string
    /** Additional security information */
    info?: string
    /** Factory contract instance */
    factory: IFactory
    /** BusinessLogicResolver address */
    businessLogicResolver: string
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Deploy an equity token using the Factory contract.
 *
 * This function constructs the required data structures and calls the factory's
 * deployEquity method to create a new equity token with a diamond proxy.
 *
 * @param params - Equity deployment parameters
 * @returns Deployed ResolverProxy (diamond) contract instance
 *
 * @example
 * ```typescript
 * const equity = await deployEquityFromFactory({
 *   adminAccount: deployer.address,
 *   isWhiteList: true,
 *   isControllable: true,
 *   isMultiPartition: false,
 *   name: 'My Equity',
 *   symbol: 'MEQ',
 *   decimals: 18,
 *   isin: 'US0378331005',
 *   votingRight: true,
 *   // ... other params
 *   regulationType: RegulationType.REG_S,
 *   regulationSubType: RegulationSubType.NONE,
 *   factory: factoryContract,
 *   businessLogicResolver: blrAddress,
 * });
 * ```
 */
export async function deployEquityFromFactory(
    params: DeployEquityFromFactoryParams
): Promise<ResolverProxy> {
    const {
        adminAccount,
        isWhiteList,
        isControllable,
        arePartitionsProtected = false,
        clearingActive = false,
        internalKycActivated = true,
        isMultiPartition,
        name,
        symbol,
        decimals,
        isin,
        votingRight,
        informationRight,
        liquidationRight,
        subscriptionRight,
        conversionRight,
        redemptionRight,
        putRight,
        dividendRight,
        currency,
        numberOfShares,
        nominalValue,
        regulationType,
        regulationSubType,
        countriesControlListType = true,
        listOfCountries = '',
        info = '',
        factory,
        businessLogicResolver,
    } = params

    // Get default admin role (bytes32(0))
    const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero

    // Build RBAC array with admin
    const rbacs = [
        {
            role: DEFAULT_ADMIN_ROLE,
            members: [adminAccount],
        },
    ]

    // Build resolver proxy configuration
    const resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
    }

    // Build security data structure
    const securityData = {
        arePartitionsProtected,
        isMultiPartition,
        resolver: businessLogicResolver,
        resolverProxyConfiguration,
        rbacs,
        isControllable,
        isWhiteList,
        maxSupply: numberOfShares,
        erc20MetadataInfo: {
            name,
            symbol,
            isin,
            decimals,
        },
        clearingActive,
        internalKycActivated,
        erc20VotesActivated: false,
        externalPauses: [],
        externalControlLists: [],
        externalKycLists: [],
        compliance: ethers.constants.AddressZero,
        identityRegistry: ethers.constants.AddressZero,
    }

    // Build equity details structure
    const equityDetails = {
        votingRight,
        informationRight,
        liquidationRight,
        subscriptionRight,
        conversionRight,
        redemptionRight,
        putRight,
        dividendRight,
        currency,
        nominalValue,
    }

    // Build equity data
    const equityData = {
        security: securityData,
        equityDetails,
    }

    // Build regulation data
    const factoryRegulationData = {
        regulationType,
        regulationSubType,
        additionalSecurityData: {
            countriesControlListType,
            listOfCountries,
            info,
        },
    }

    // Deploy equity token via factory
    const tx = await factory.deployEquity(equityData, factoryRegulationData, {
        gasLimit: GAS_LIMIT.high,
    })
    const receipt = await tx.wait()

    // Find EquityDeployed event to get diamond address
    const event = receipt.events?.find((e) => e.event === 'EquityDeployed')
    if (!event || !event.args) {
        throw new Error(
            `EquityDeployed event not found in deployment transaction. Events: ${JSON.stringify(
                receipt.events?.map((e) => e.event)
            )}`
        )
    }

    const diamondAddress = event.args.diamondProxyAddress || event.args[1]

    if (!diamondAddress || diamondAddress === ethers.constants.AddressZero) {
        throw new Error(
            `Invalid diamond address from event. Args: ${JSON.stringify(event.args)}`
        )
    }

    // Return diamond proxy as ResolverProxy contract
    return ResolverProxy__factory.connect(diamondAddress, factory.signer)
}
