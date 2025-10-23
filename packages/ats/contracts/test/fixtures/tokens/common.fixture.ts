import {
    ATS_ROLES,
    AtsRoleHash,
    AtsRoleName,
    DeepPartial,
    EQUITY_CONFIG_ID,
    BOND_CONFIG_ID,
    RegulationSubType,
    RegulationType,
} from '@scripts'
import {
    FactoryRegulationDataParams,
    Rbac,
    SecurityDataParams,
} from '@scripts/domain'
import { AccessControlFacet, BusinessLogicResolver } from '@typechain'
import { ethers } from 'hardhat'
import { isinGenerator } from '@thomaschaplin/isin-generator'
import { resolverProxy } from '@typechain/contracts/resolver'

export const MAX_UINT256 = ethers.constants.MaxUint256

export const TEST_PARTITIONS = {
    DEFAULT: ethers.utils.formatBytes32String('default'),
    PARTITION_1: ethers.utils.formatBytes32String('partition1'),
    PARTITION_2: ethers.utils.formatBytes32String('partition2'),
    PARTITION_3: ethers.utils.formatBytes32String('partition3'),
} as const

export const TEST_AMOUNTS = {
    SMALL: ethers.utils.parseUnits('100', 6),
    MEDIUM: ethers.utils.parseUnits('1000', 6),
    LARGE: ethers.utils.parseUnits('10000', 6),
} as const

export async function executeRbac(
    accessControlFacet: AccessControlFacet,
    rbac: Rbac[]
) {
    await Promise.all(
        rbac.map(async (r) => {
            const roleHash =
                ATS_ROLES[r.role as AtsRoleName] || (r.role as AtsRoleHash)
            await Promise.all(
                r.members.map(async (m) => {
                    return accessControlFacet.grantRole(roleHash, m)
                })
            )
        })
    )
}

export const DEFAULT_SECURITY_PARAMS = {
    isWhiteList: false,
    isControllable: true,
    arePartitionsProtected: false,
    isMultiPartition: false,
    maxSupply: ethers.constants.MaxUint256,
    name: 'TEST_Security',
    symbol: 'TEST',
    decimals: 6,
    clearingActive: false,
    internalKycActivated: true,
    externalPauses: [],
    externalControlLists: [],
    externalKycLists: [],
    erc20VotesActivated: false,
    compliance: ethers.constants.AddressZero,
    identityRegistry: ethers.constants.AddressZero,
    rbacs: [],
}

export function getSecurityData(
    blr: BusinessLogicResolver,
    params?: DeepPartial<SecurityDataParams>
): SecurityDataParams {
    return {
        arePartitionsProtected:
            params?.arePartitionsProtected ??
            DEFAULT_SECURITY_PARAMS.arePartitionsProtected,
        isMultiPartition:
            params?.isMultiPartition ??
            DEFAULT_SECURITY_PARAMS.isMultiPartition,
        resolver: blr.address,
        rbacs: (params?.rbacs as Rbac[]) ?? DEFAULT_SECURITY_PARAMS.rbacs,
        isControllable:
            params?.isControllable ?? DEFAULT_SECURITY_PARAMS.isControllable,
        isWhiteList: params?.isWhiteList ?? DEFAULT_SECURITY_PARAMS.isWhiteList,
        maxSupply: params?.maxSupply ?? DEFAULT_SECURITY_PARAMS.maxSupply,
        erc20MetadataInfo: {
            name:
                params?.erc20MetadataInfo?.name ?? DEFAULT_SECURITY_PARAMS.name,
            symbol:
                params?.erc20MetadataInfo?.symbol ??
                DEFAULT_SECURITY_PARAMS.symbol,
            decimals:
                params?.erc20MetadataInfo?.decimals ??
                DEFAULT_SECURITY_PARAMS.decimals,
            isin: params?.erc20MetadataInfo?.isin ?? isinGenerator(),
        },
        clearingActive:
            params?.clearingActive ?? DEFAULT_SECURITY_PARAMS.clearingActive,
        internalKycActivated:
            params?.internalKycActivated ??
            DEFAULT_SECURITY_PARAMS.internalKycActivated,
        externalPauses: [
            ...((params?.externalPauses as string[]) ??
                DEFAULT_SECURITY_PARAMS.externalPauses),
        ],
        externalControlLists:
            (params?.externalControlLists as string[]) ??
            DEFAULT_SECURITY_PARAMS.externalControlLists,
        externalKycLists:
            (params?.externalKycLists as string[]) ??
            DEFAULT_SECURITY_PARAMS.externalKycLists,
        erc20VotesActivated:
            params?.erc20VotesActivated ??
            DEFAULT_SECURITY_PARAMS.erc20VotesActivated,
        compliance: params?.compliance ?? DEFAULT_SECURITY_PARAMS.compliance,
        identityRegistry:
            params?.identityRegistry ??
            DEFAULT_SECURITY_PARAMS.identityRegistry,
        resolverProxyConfiguration: {
            key: params?.resolverProxyConfiguration?.key ?? EQUITY_CONFIG_ID,
            version: params?.resolverProxyConfiguration?.version ?? 1,
        },
    }
}

export const DEFAULT_REGULATION_PARAMS = {
    regulationType: RegulationType.REG_S,
    regulationSubType: RegulationSubType.NONE,
    countriesControlListType: true,
    listOfCountries: 'US,GB,CH',
    info: 'Test token for unit tests',
}

export function getRegulationData(
    params?: DeepPartial<FactoryRegulationDataParams>
) {
    return {
        regulationType:
            params?.regulationType ?? DEFAULT_REGULATION_PARAMS.regulationType,
        regulationSubType:
            params?.regulationSubType ??
            DEFAULT_REGULATION_PARAMS.regulationSubType,
        additionalSecurityData: {
            countriesControlListType:
                params?.additionalSecurityData?.countriesControlListType ??
                DEFAULT_REGULATION_PARAMS.countriesControlListType,
            listOfCountries:
                params?.additionalSecurityData?.listOfCountries ??
                DEFAULT_REGULATION_PARAMS.listOfCountries,
            info:
                params?.additionalSecurityData?.info ??
                DEFAULT_REGULATION_PARAMS.info,
        },
    }
}
