import { ethers } from 'hardhat'
import { IFactory } from '../typechain-types'
import {
    transparentUpgradableProxy,
    deployTransparentUpgradeableProxy,
} from './transparentUpgradableProxy'
import {
    EquityDeployedEvent,
    _DEFAULT_ADMIN_ROLE,
    BondDeployedEvent,
} from './constants'
import { environment } from './deployEnvironmentByRpc'

export let factory: IFactory

export async function deployProxyToFactory(
    factoryBusinessLogicAddress: string
) {
    await deployTransparentUpgradeableProxy(factoryBusinessLogicAddress)
    factory = await ethers.getContractAt(
        'Factory',
        transparentUpgradableProxy.address
    )
}

export interface Rbac {
    role: string
    members: string[]
}

export interface ERC20MetadataInfo {
    name: string
    symbol: string
    isin: string
    decimals: number
}

export interface ERC20Metadata {
    info: ERC20MetadataInfo
    securityType: number
}

export enum DividendType {
    NONE = 0,
    PREFERRED = 1,
    COMMON = 2,
}

export enum SecurityType {
    BOND = 0,
    EQUITY = 1,
}

export interface EquityDetailsData {
    votingRight: boolean
    informationRight: boolean
    liquidationRight: boolean
    subscriptionRight: boolean
    convertionRight: boolean
    redemptionRight: boolean
    putRight: boolean
    dividendRight: DividendType
    currency: string
    nominalValue: number
}

export interface BondDetailsData {
    currency: string
    nominalValue: number
    startingDate: number
    maturityDate: number
}

export interface CouponDetailsData {
    couponFrequency: number
    couponRate: number
    firstCouponDate: number
}

export interface SecurityData {
    isMultiPartition: boolean
    resolver: string
    businessLogicKeys: string[]
    rbacs: Rbac[]
    isControllable: boolean
    isWhiteList: boolean
    maxSupply: number
    erc20MetadataInfo: ERC20MetadataInfo
}

export interface EquityData {
    security: SecurityData
    equityDetails: EquityDetailsData
}

export interface BondData {
    security: SecurityData
    bondDetails: BondDetailsData
    couponDetails: CouponDetailsData
}

export interface AdditionalSecurityData {
    countriesControlListType: boolean
    listOfCountries: string
    info: string
}

export interface FactoryRegulationData {
    regulationType: number
    regulationSubType: number
    additionalSecurityData: AdditionalSecurityData
}

export const RegulationType = {
    NONE: 0,
    REG_S: 1,
    REG_D: 2,
}

export const RegulationSubType = {
    NONE: 0,
    REG_D_506_B: 1,
    REG_D_506_C: 2,
}

export async function setFactoryRegulationData(
    regulationType: number,
    regulationSubType: number,
    countriesControlListType: boolean,
    listOfCountries: string,
    info: string
) {
    const additionalSecurityData: AdditionalSecurityData = {
        countriesControlListType: countriesControlListType,
        listOfCountries: listOfCountries,
        info: info,
    }

    const factoryRegulationData: FactoryRegulationData = {
        regulationType: regulationType,
        regulationSubType: regulationSubType,
        additionalSecurityData: additionalSecurityData,
    }

    return factoryRegulationData
}

export async function setEquityData(
    adminAccount: string,
    isWhiteList: boolean,
    isControllable: boolean,
    isMultiPartition: boolean,
    name: string,
    symbol: string,
    decimals: number,
    isin: string,
    votingRight: boolean,
    informationRight: boolean,
    liquidationRight: boolean,
    subscriptionRight: boolean,
    convertionRight: boolean,
    redemptionRight: boolean,
    putRight: boolean,
    dividendRight: DividendType,
    currency: string,
    numberOfShares: number,
    nominalValue: number,
    init_rbacs?: Rbac[],
    addAdmin = true,
    initBusinessLogicKeys?: string[],
    initResolver?: string
) {
    let rbacs: Rbac[] = []

    if (addAdmin) {
        const rbacAdmin: Rbac = {
            role: _DEFAULT_ADMIN_ROLE,
            members: [adminAccount],
        }
        rbacs = [rbacAdmin]
    }

    if (init_rbacs) {
        rbacs = rbacs.concat(init_rbacs)
    }

    const businessLogicKeys: string[] = initBusinessLogicKeys
        ? initBusinessLogicKeys
        : [
              await environment.deployedBusinessLogics.diamondFacet.getStaticResolverKey(),
              await environment.deployedBusinessLogics.accessControl.getStaticResolverKey(),
              await environment.deployedBusinessLogics.pause.getStaticResolverKey(),
              await environment.deployedBusinessLogics.controlList.getStaticResolverKey(),
              await environment.deployedBusinessLogics.corporateActionsSecurity.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC20.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC1644.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC1410ScheduledSnapshot.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC1594.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC1643.getStaticResolverKey(),
              await environment.deployedBusinessLogics.equityUSA.getStaticResolverKey(),
              await environment.deployedBusinessLogics.snapshots.getStaticResolverKey(),
              await environment.deployedBusinessLogics.scheduledSnapshots.getStaticResolverKey(),
              await environment.deployedBusinessLogics.cap.getStaticResolverKey(),
              await environment.deployedBusinessLogics.lock.getStaticResolverKey(),
              await environment.deployedBusinessLogics.transferAndLock.getStaticResolverKey(),
          ]
    const resolver = initResolver ? initResolver : environment.resolver.address

    const erc20MetadataInfo: ERC20MetadataInfo = {
        name,
        symbol,
        isin,
        decimals,
    }

    const security: SecurityData = {
        isMultiPartition: isMultiPartition,
        resolver: resolver,
        businessLogicKeys: businessLogicKeys,
        rbacs: rbacs,
        isControllable: isControllable,
        isWhiteList: isWhiteList,
        maxSupply: numberOfShares,
        erc20MetadataInfo: erc20MetadataInfo,
    }

    const equityDetails: EquityDetailsData = {
        votingRight: votingRight,
        informationRight: informationRight,
        liquidationRight: liquidationRight,
        subscriptionRight: subscriptionRight,
        convertionRight: convertionRight,
        redemptionRight: redemptionRight,
        putRight: putRight,
        dividendRight: dividendRight,
        currency: currency,
        nominalValue: nominalValue,
    }

    const equityData: EquityData = {
        security,
        equityDetails,
    }

    return equityData
}

export async function setBondData(
    adminAccount: string,
    isWhiteList: boolean,
    isControllable: boolean,
    isMultiPartition: boolean,
    name: string,
    symbol: string,
    decimals: number,
    isin: string,
    currency: string,
    numberOfUnits: number,
    nominalValue: number,
    startingDate: number,
    maturityDate: number,
    couponFrequency: number,
    couponRate: number,
    firstCouponDate: number,
    init_rbacs?: Rbac[],
    addAdmin = true,
    initBusinessLogicKeys?: string[],
    initResolver?: string
) {
    let rbacs: Rbac[] = []

    if (addAdmin) {
        const rbacAdmin: Rbac = {
            role: _DEFAULT_ADMIN_ROLE,
            members: [adminAccount],
        }
        rbacs = [rbacAdmin]
    }

    if (init_rbacs) {
        rbacs = rbacs.concat(init_rbacs)
    }

    const businessLogicKeys: string[] = initBusinessLogicKeys
        ? initBusinessLogicKeys
        : [
              await environment.deployedBusinessLogics.diamondFacet.getStaticResolverKey(),
              await environment.deployedBusinessLogics.accessControl.getStaticResolverKey(),
              await environment.deployedBusinessLogics.pause.getStaticResolverKey(),
              await environment.deployedBusinessLogics.controlList.getStaticResolverKey(),
              await environment.deployedBusinessLogics.corporateActionsSecurity.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC20.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC1644.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC1410ScheduledSnapshot.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC1594.getStaticResolverKey(),
              await environment.deployedBusinessLogics.eRC1643.getStaticResolverKey(),
              await environment.deployedBusinessLogics.bondUSA.getStaticResolverKey(),
              await environment.deployedBusinessLogics.snapshots.getStaticResolverKey(),
              await environment.deployedBusinessLogics.scheduledSnapshots.getStaticResolverKey(),
              await environment.deployedBusinessLogics.cap.getStaticResolverKey(),
              await environment.deployedBusinessLogics.lock.getStaticResolverKey(),
          ]
    const resolver = initResolver ? initResolver : environment.resolver.address

    const erc20MetadataInfo: ERC20MetadataInfo = {
        name,
        symbol,
        isin,
        decimals,
    }

    const security: SecurityData = {
        isMultiPartition: isMultiPartition,
        resolver: resolver,
        businessLogicKeys: businessLogicKeys,
        rbacs: rbacs,
        isControllable: isControllable,
        isWhiteList: isWhiteList,
        maxSupply: numberOfUnits,
        erc20MetadataInfo: erc20MetadataInfo,
    }

    const bondDetails: BondDetailsData = {
        currency: currency, // EUR
        nominalValue: nominalValue,
        startingDate: startingDate,
        maturityDate: maturityDate,
    }

    const couponDetails: CouponDetailsData = {
        couponFrequency: couponFrequency,
        couponRate: couponRate,
        firstCouponDate: firstCouponDate,
    }

    const bondData: BondData = {
        security,
        bondDetails,
        couponDetails,
    }

    return bondData
}

export async function deployEquityFromFactory(
    adminAccount: string,
    isWhiteList: boolean,
    isControllable: boolean,
    isMultiPartition: boolean,
    name: string,
    symbol: string,
    decimals: number,
    isin: string,
    votingRight: boolean,
    informationRight: boolean,
    liquidationRight: boolean,
    subscriptionRight: boolean,
    convertionRight: boolean,
    redemptionRight: boolean,
    putRight: boolean,
    dividendRight: DividendType,
    currency: string,
    numberOfShares: number,
    nominalValue: number,
    regulationType: number,
    regulationSubType: number,
    countriesControlListType: boolean,
    listOfCountries: string,
    info: string,
    init_rbacs?: Rbac[],
    addAdmin = true,
    initBusinessLogicKeys?: string[],
    initResolver?: string
) {
    const equityData = await setEquityData(
        adminAccount,
        isWhiteList,
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
        addAdmin,
        initBusinessLogicKeys,
        initResolver
    )

    const factoryRegulationData = await setFactoryRegulationData(
        regulationType,
        regulationSubType,
        countriesControlListType,
        listOfCountries,
        info
    )

    const result = await environment.factory.deployEquity(
        equityData,
        factoryRegulationData
    )
    const events = (await result.wait()).events!
    const deployedEquityEvent = events.find(
        (e) => e.event == EquityDeployedEvent
    )
    const equityAddress = deployedEquityEvent!.args!.equityAddress

    return await ethers.getContractAt('Equity', equityAddress)
}

export async function deployBondFromFactory(
    adminAccount: string,
    isWhiteList: boolean,
    isControllable: boolean,
    isMultiPartition: boolean,
    name: string,
    symbol: string,
    decimals: number,
    isin: string,
    currency: string,
    numberOfUnits: number,
    nominalValue: number,
    startingDate: number,
    maturityDate: number,
    couponFrequency: number,
    couponRate: number,
    firstCouponDate: number,
    regulationType: number,
    regulationSubType: number,
    countriesControlListType: boolean,
    listOfCountries: string,
    info: string,
    init_rbacs?: Rbac[],
    addAdmin = true,
    initBusinessLogicKeys?: string[],
    initResolver?: string
) {
    const bondData = await setBondData(
        adminAccount,
        isWhiteList,
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
        addAdmin,
        initBusinessLogicKeys,
        initResolver
    )

    const factoryRegulationData = await setFactoryRegulationData(
        regulationType,
        regulationSubType,
        countriesControlListType,
        listOfCountries,
        info
    )

    const result = await environment.factory.deployBond(
        bondData,
        factoryRegulationData
    )
    const events = (await result.wait()).events!
    const deployedBondEvent = events.find((e) => e.event == BondDeployedEvent)
    const bondAddress = deployedBondEvent!.args!.bondAddress

    return await ethers.getContractAt('Bond', bondAddress)
}
