import { ethers } from 'ethers'
import type { IFactory, ResolverProxy } from '@typechain'
import { ResolverProxy__factory } from '@typechain'
import { GAS_LIMIT } from '@scripts/infrastructure'
import { ATS_ROLES, EQUITY_CONFIG_ID } from '@scripts/domain'
import {
    EquityDetailsDataParams,
    FactoryRegulationDataParams,
    Rbac,
    SecurityDataParams,
} from './types'

// ============================================================================
// Types
// ============================================================================

/**
 * Parameters for deploying an equity token from the factory.
 */
export interface DeployEquityFromFactoryParams {
    /** Admin account address */
    adminAccount: string
    factory: IFactory
    securityData: SecurityDataParams
    equityDetails: EquityDetailsDataParams
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
    params: DeployEquityFromFactoryParams,
    regulationTypeParams: FactoryRegulationDataParams
): Promise<ResolverProxy> {
    const {
        adminAccount,
        factory,
        equityDetails: equityDetailsParams,
        securityData: securityDataParams,
    } = params

    // Build RBAC array with admin
    const rbacs: Rbac[] = [
        {
            role: ATS_ROLES.DEFAULT_ADMIN,
            members: [adminAccount],
        },
        ...securityDataParams.rbacs,
    ]

    // Build resolver proxy configuration
    const resolverProxyConfiguration = {
        key: EQUITY_CONFIG_ID,
        version: 1,
    }

    // Build security data structure
    const securityData = {
        arePartitionsProtected: securityDataParams.arePartitionsProtected,
        isMultiPartition: securityDataParams.isMultiPartition,
        resolver: securityDataParams.resolver,
        resolverProxyConfiguration,
        rbacs,
        isControllable: securityDataParams.isControllable,
        isWhiteList: securityDataParams.isWhiteList,
        maxSupply: securityDataParams.maxSupply,
        erc20MetadataInfo: {
            name: securityDataParams.erc20MetadataInfo.name,
            symbol: securityDataParams.erc20MetadataInfo.symbol,
            isin: securityDataParams.erc20MetadataInfo.isin,
            decimals: securityDataParams.erc20MetadataInfo.decimals,
        },
        clearingActive: securityDataParams.clearingActive,
        internalKycActivated: securityDataParams.internalKycActivated,
        erc20VotesActivated: securityDataParams.erc20VotesActivated,
        externalPauses: securityDataParams.externalPauses,
        externalControlLists: securityDataParams.externalControlLists,
        externalKycLists: securityDataParams.externalKycLists,
        compliance: securityDataParams.compliance,
        identityRegistry: securityDataParams.identityRegistry,
    }

    // Build equity details structure
    const equityDetails = {
        votingRight: equityDetailsParams.votingRight,
        informationRight: equityDetailsParams.informationRight,
        liquidationRight: equityDetailsParams.liquidationRight,
        subscriptionRight: equityDetailsParams.subscriptionRight,
        conversionRight: equityDetailsParams.conversionRight,
        redemptionRight: equityDetailsParams.redemptionRight,
        putRight: equityDetailsParams.putRight,
        dividendRight: equityDetailsParams.dividendRight,
        currency: equityDetailsParams.currency,
        nominalValue: equityDetailsParams.nominalValue,
    }

    // Build equity data
    const equityData = {
        security: securityData,
        equityDetails,
    }

    // Build regulation data
    const factoryRegulationData = {
        regulationType: regulationTypeParams.regulationType,
        regulationSubType: regulationTypeParams.regulationSubType,
        additionalSecurityData: {
            countriesControlListType:
                regulationTypeParams.additionalSecurityData
                    .countriesControlListType,
            listOfCountries:
                regulationTypeParams.additionalSecurityData.listOfCountries,
            info: regulationTypeParams.additionalSecurityData.info,
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
