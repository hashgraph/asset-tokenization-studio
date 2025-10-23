import { deployAtsInfrastructureFixture } from '../infrastructure.fixture'
import {
    CURRENCIES,
    DeepPartial,
    TIME_PERIODS_S,
    BOND_CONFIG_ID,
} from '../../../scripts'
import {
    AccessControlFacet__factory,
    PauseFacet__factory,
    KycFacet__factory,
    ControlListFacet__factory,
    TimeTravelFacet__factory,
} from '@typechain'
import {
    DeployBondFromFactoryParams,
    deployBondFromFactory,
} from '@scripts/domain'
import {
    BondDetailsDataParams,
    FactoryRegulationDataParams,
} from '@scripts/domain'
import { getRegulationData, getSecurityData } from './common.fixture'
import { getDltTimestamp } from '@test'

/**
 * Default bond token parameters.
 * Override by passing custom params to fixture functions.
 */
export const DEFAULT_BOND_PARAMS = {
    currency: CURRENCIES.USD,
    nominalValue: 100,
    proceedRecipients: [] as string[],
    proceedRecipientsData: [] as string[],
    startingDate: async () => {
        return (await getDltTimestamp()) + 3600 //block.timestamp + 1 hour
    },
} as const

export async function getBondDetails(
    params?: DeepPartial<BondDetailsDataParams>
) {
    const maturityDate =
        params?.maturityDate ??
        (params?.startingDate
            ? params.startingDate + TIME_PERIODS_S.YEAR
            : (await DEFAULT_BOND_PARAMS.startingDate()) + TIME_PERIODS_S.YEAR)
    return {
        currency: params?.currency ?? DEFAULT_BOND_PARAMS.currency,
        nominalValue: params?.nominalValue ?? DEFAULT_BOND_PARAMS.nominalValue,
        startingDate:
            params?.startingDate ?? (await DEFAULT_BOND_PARAMS.startingDate()),
        maturityDate: maturityDate,
    }
}

/**
 * Fixture: Deploy ATS infrastructure + single Bond token
 *
 * Extends deployAtsInfrastructureFixture with a deployed bond token
 * using default parameters (single partition, controllable, internal KYC).
 *
 * @param tokenParams - Optional custom token parameters (merged with defaults)
 * @returns Infrastructure + deployed bond token + connected facets
 */
export async function deployBondTokenFixture({
    bondDataParams,
    regulationTypeParams,
}: {
    bondDataParams?: DeepPartial<DeployBondFromFactoryParams>
    regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>
} = {}) {
    const infrastructure = await deployAtsInfrastructureFixture()
    const { factory, blr, deployer } = infrastructure

    const securityData = getSecurityData(blr, {
        ...bondDataParams?.securityData,
        resolverProxyConfiguration: {
            key: BOND_CONFIG_ID,
            version: 1,
        },
    })
    const bondDetails = await getBondDetails(bondDataParams?.bondDetails)

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
        getRegulationData(regulationTypeParams)
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
