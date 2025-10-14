import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployAtsInfrastructureFixture } from '../infrastructure.fixture'
import {
    RegulationType,
    RegulationSubType,
    CURRENCIES,
    DeepPartial,
    TIME_PERIODS_S,
} from '../../../scripts'
import {
    AccessControlFacet__factory,
    PauseFacet__factory,
    KycFacet__factory,
    ControlListFacet__factory,
} from '@typechain'
import { isinGenerator } from '@thomaschaplin/isin-generator'
import {
    DeployBondFromFactoryParams,
    deployBondFromFactory,
} from '@scripts/domain/factory/deployBondToken'
import { FactoryRegulationDataParams } from '@scripts/domain/factory/types'

/**
 * Default bond token parameters.
 * Override by passing custom params to fixture functions.
 */
export const DEFAULT_BOND_PARAMS = {
    isWhiteList: false,
    isControllable: true,
    arePartitionsProtected: false,
    clearingActive: false,
    internalKycActivated: true,
    isMultiPartition: false,
    name: 'TEST_Token',
    symbol: 'TEST',
    decimals: 6,
    erc20VotesActivated: false,
    currency: CURRENCIES.USD,
    maxSupply: ethers.constants.MaxUint256,
    nominalValue: 100,
    regulationType: RegulationType.REG_S,
    regulationSubType: RegulationSubType.NONE,
    countriesControlListType: true,
    listOfCountries: 'US,GB,CH',
    info: 'Test token for unit tests',
    proceedRecipients: [] as string[],
    proceedRecipientsData: [] as string[],
    startingDate: Math.floor(Date.now() / 1000),
    externalPauses: [],
    externalControlLists: [],
    externalKycLists: [],
} as const

/**
 * Fixture: Deploy ATS infrastructure + single Bond token
 *
 * Extends deployAtsInfrastructureFixture with a deployed bond token
 * using default parameters (single partition, controllable, internal KYC).
 *
 * @param tokenParams - Optional custom token parameters (merged with defaults)
 * @returns Infrastructure + deployed bond token + connected facets
 */
export async function deployBondTokenFixture(
    bondDataParams?: DeepPartial<DeployBondFromFactoryParams>,
    regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>
) {
    const infrastructure = await loadFixture(deployAtsInfrastructureFixture)
    const { factory, blr, deployer } = infrastructure

    const maturityDate =
        bondDataParams?.bondDetails?.maturityDate ??
        (bondDataParams?.bondDetails?.startingDate
            ? bondDataParams.bondDetails.startingDate * 1 * TIME_PERIODS_S.YEAR
            : DEFAULT_BOND_PARAMS.startingDate * 1 * TIME_PERIODS_S.YEAR)

    const securityData = {
        arePartitionsProtected:
            bondDataParams?.securityData?.arePartitionsProtected ??
            DEFAULT_BOND_PARAMS.arePartitionsProtected,
        isMultiPartition:
            bondDataParams?.securityData?.isMultiPartition ??
            DEFAULT_BOND_PARAMS.isMultiPartition,
        businessLogicResolver: blr.address,
        isControllable:
            bondDataParams?.securityData?.isControllable ??
            DEFAULT_BOND_PARAMS.isControllable,
        isWhiteList:
            bondDataParams?.securityData?.isWhiteList ??
            DEFAULT_BOND_PARAMS.isWhiteList,
        maxSupply:
            bondDataParams?.securityData?.maxSupply ??
            DEFAULT_BOND_PARAMS.maxSupply,
        name: bondDataParams?.securityData?.name ?? DEFAULT_BOND_PARAMS.name,
        symbol:
            bondDataParams?.securityData?.symbol ?? DEFAULT_BOND_PARAMS.symbol,
        decimals:
            bondDataParams?.securityData?.decimals ??
            DEFAULT_BOND_PARAMS.decimals,
        isin: bondDataParams?.securityData?.isin ?? isinGenerator(),
        clearingActive:
            bondDataParams?.securityData?.clearingActive ??
            DEFAULT_BOND_PARAMS.clearingActive,
        internalKycActivated:
            bondDataParams?.securityData?.internalKycActivated ??
            DEFAULT_BOND_PARAMS.internalKycActivated,
        externalPauses: [
            ...((bondDataParams?.securityData?.externalPauses as string[]) ??
                DEFAULT_BOND_PARAMS.externalPauses),
        ],
        externalControlLists: [
            ...((bondDataParams?.securityData
                ?.externalControlLists as string[]) ??
                DEFAULT_BOND_PARAMS.externalControlLists),
        ],
        externalKycLists: [
            ...((bondDataParams?.securityData?.externalKycLists as string[]) ??
                DEFAULT_BOND_PARAMS.externalKycLists),
        ],
        erc20VotesActivated:
            bondDataParams?.securityData?.erc20VotesActivated ??
            DEFAULT_BOND_PARAMS.erc20VotesActivated,
        compliance: ethers.constants.AddressZero,
        identityRegistry: ethers.constants.AddressZero,
    }
    const bondDetails = {
        currency:
            bondDataParams?.bondDetails?.currency ??
            DEFAULT_BOND_PARAMS.currency,
        nominalValue:
            bondDataParams?.bondDetails?.nominalValue ??
            DEFAULT_BOND_PARAMS.nominalValue,
        startingDate:
            bondDataParams?.bondDetails?.startingDate ??
            DEFAULT_BOND_PARAMS.startingDate,
        maturityDate: maturityDate,
    }
    const diamond = await deployBondFromFactory(
        {
            adminAccount: deployer.address,
            factory: factory,
            securityData,
            bondDetails,
            proceedRecipients: [
                ...((bondDataParams?.proceedRecipients as string[]) ??
                    DEFAULT_BOND_PARAMS.proceedRecipients),
            ],
            proceedRecipientsData: [
                ...((bondDataParams?.proceedRecipientsData as string[]) ??
                    DEFAULT_BOND_PARAMS.proceedRecipientsData),
            ],
        },
        {
            regulationType:
                regulationTypeParams?.regulationType ??
                DEFAULT_BOND_PARAMS.regulationType,
            regulationSubType:
                regulationTypeParams?.regulationSubType ??
                DEFAULT_BOND_PARAMS.regulationSubType,
            countriesControlListType:
                regulationTypeParams?.countriesControlListType ??
                DEFAULT_BOND_PARAMS.countriesControlListType,
            listOfCountries:
                regulationTypeParams?.listOfCountries ??
                DEFAULT_BOND_PARAMS.listOfCountries,
            info: regulationTypeParams?.info ?? DEFAULT_BOND_PARAMS.info,
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
