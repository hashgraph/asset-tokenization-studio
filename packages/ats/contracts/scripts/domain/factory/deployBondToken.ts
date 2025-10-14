import { ethers } from 'ethers'
import type { IFactory, ResolverProxy } from '@typechain'
import { ResolverProxy__factory } from '@typechain'
import { GAS_LIMIT } from '@scripts/infrastructure'
import { BOND_CONFIG_ID } from '@scripts/domain'
import {
    BondDetailsDataParams,
    FactoryRegulationDataParams,
    SecurityDataParams,
} from './types'

// ============================================================================
// Types
// ============================================================================

/**
 * Parameters for deploying a bond token from the factory.
 */
export interface DeployBondFromFactoryParams {
    /** Admin account address */
    adminAccount: string
    factory: IFactory
    securityData: SecurityDataParams
    bondDetails: BondDetailsDataParams
    proceedRecipients: string[]
    proceedRecipientsData: string[]
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Deploy a bond token using the Factory contract.
 *
 * This function constructs the required data structures and calls the factory's
 * deployBond method to create a new bond token with a diamond proxy.
 *
 * @param bondData - Bond deployment parameters
 * @returns Deployed ResolverProxy (diamond) contract instance
 *
 * @example
 * ```typescript
 * const bond = await deployBondFromFactory({
 *   adminAccount: deployer.address,
 *   isWhiteList: true,
 *   isControllable: true,
 *   isMultiPartition: false,
 *   name: 'My Bond',
 *   symbol: 'MBND',
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
export async function deployBondFromFactory(
    bondDataParams: DeployBondFromFactoryParams,
    regulationTypeParams: FactoryRegulationDataParams
): Promise<ResolverProxy> {
    const {
        factory,
        adminAccount,
        securityData: securityDataParams,
        bondDetails: bondDetailsParams,
        proceedRecipients,
        proceedRecipientsData,
    } = bondDataParams

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
        key: BOND_CONFIG_ID,
        version: 1,
    }

    // Build security data structure
    const securityData = {
        arePartitionsProtected: securityDataParams.arePartitionsProtected,
        isMultiPartition: securityDataParams.isMultiPartition,
        resolver: securityDataParams.businessLogicResolver,
        resolverProxyConfiguration,
        rbacs,
        isControllable: securityDataParams.isControllable,
        isWhiteList: securityDataParams.isWhiteList,
        maxSupply: securityDataParams.maxSupply,
        erc20MetadataInfo: {
            name: securityDataParams.name,
            symbol: securityDataParams.symbol,
            isin: securityDataParams.isin,
            decimals: securityDataParams.decimals,
        },
        clearingActive: securityDataParams.clearingActive,
        internalKycActivated: securityDataParams.internalKycActivated,
        erc20VotesActivated: securityDataParams.erc20VotesActivated || false,
        externalPauses: securityDataParams.externalPauses || [],
        externalControlLists: securityDataParams.externalControlLists || [],
        externalKycLists: securityDataParams.externalKycLists || [],
        compliance:
            securityDataParams.compliance || ethers.constants.AddressZero,
        identityRegistry:
            securityDataParams.identityRegistry || ethers.constants.AddressZero,
    }

    // Build bond details structure
    const bondDetails = {
        currency: bondDetailsParams.currency,
        nominalValue: bondDetailsParams.nominalValue,
        startingDate:
            bondDetailsParams.startingDate || Math.floor(Date.now() / 1000),
        maturityDate: bondDetailsParams.maturityDate || 0,
    }

    // Build bond data
    const bondData = {
        security: securityData,
        bondDetails,
        proceedRecipients: proceedRecipients || [],
        proceedRecipientsData: proceedRecipientsData || [],
    }

    // Build regulation data
    const factoryRegulationData = {
        regulationType: regulationTypeParams.regulationType,
        regulationSubType: regulationTypeParams.regulationSubType,
        additionalSecurityData: {
            countriesControlListType:
                regulationTypeParams.countriesControlListType,
            listOfCountries: regulationTypeParams.listOfCountries,
            info: regulationTypeParams.info,
        },
    }

    // Deploy bond token via factory
    const tx = await factory.deployBond(bondData, factoryRegulationData, {
        gasLimit: GAS_LIMIT.high,
    })
    const receipt = await tx.wait()

    // Find BondDeployed event to get diamond address
    const event = receipt.events?.find((e) => e.event === 'BondDeployed')
    if (!event || !event.args) {
        throw new Error(
            `BondDeployed event not found in deployment transaction. Events: ${JSON.stringify(
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
