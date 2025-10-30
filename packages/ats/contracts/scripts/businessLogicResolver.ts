// SPDX-License-Identifier: Apache-2.0

import {
    BusinessLogicResolver__factory,
    IBusinessLogicResolver,
    IBusinessLogicResolver__factory,
    IDiamondCutManager__factory,
    IStaticFunctionSelectors__factory,
} from '@typechain'
import { IStaticFunctionSelectors } from '@typechain'
import {
    CreateConfigurationsForDeployedContractsCommand,
    CreateConfigurationsForDeployedContractsResult,
    deployContractWithFactory,
    DeployContractWithFactoryCommand,
    DeployProxyForBusinessLogicResolverCommand,
    GAS_LIMIT,
    GetFacetsByConfigurationIdAndVersionQuery,
    GetFacetsByConfigurationIdAndVersionResult,
    MESSAGES,
    RegisterBusinessLogicsCommand,
    RegisterDeployedContractBusinessLogicsCommand,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { BOND_CONFIG_ID, EQUITY_CONFIG_ID, EVENTS } from './constants'
import { getContractFactory } from '@nomiclabs/hardhat-ethers/types'
import { FacetConfiguration } from './resolverDiamondCut'
import { Signer } from 'ethers'

export interface BusinessLogicRegistryData {
    businessLogicKey: string
    businessLogicAddress: string
}

export interface DeployedBusinessLogics {
    businessLogicResolver: IStaticFunctionSelectors
    factory: IStaticFunctionSelectors
    diamondFacet: IStaticFunctionSelectors
    accessControlFacet: IStaticFunctionSelectors
    controlListFacet: IStaticFunctionSelectors
    kycFacet: IStaticFunctionSelectors
    ssiManagementFacet: IStaticFunctionSelectors
    corporateActionsFacet: IStaticFunctionSelectors
    pauseFacet: IStaticFunctionSelectors
    ERC20Facet: IStaticFunctionSelectors
    ERC20PermitFacet: IStaticFunctionSelectors
    ERC20Votes: IStaticFunctionSelectors //TODO
    ERC1644Facet: IStaticFunctionSelectors
    erc1410ReadFacet: IStaticFunctionSelectors
    erc1410ManagementFacet: IStaticFunctionSelectors
    erc1410IssuerFacet: IStaticFunctionSelectors
    erc1410TokenHolderFacet: IStaticFunctionSelectors
    ERC1594Facet: IStaticFunctionSelectors
    ERC1643Facet: IStaticFunctionSelectors
    equityUSAFacet: IStaticFunctionSelectors
    bondUSAFacet: IStaticFunctionSelectors
    bondUSARead: IStaticFunctionSelectors //TODO
    SnapshotsFacet: IStaticFunctionSelectors
    scheduledSnapshotsFacet: IStaticFunctionSelectors
    scheduledBalanceAdjustmentsFacet: IStaticFunctionSelectors
    scheduledCrossOrderedTasksFacet: IStaticFunctionSelectors
    CapFacet: IStaticFunctionSelectors
    LockFacet: IStaticFunctionSelectors
    transferAndLockFacet: IStaticFunctionSelectors
    adjustBalancesFacet: IStaticFunctionSelectors
    protectedPartitionsFacet: IStaticFunctionSelectors
    holdReadFacet: IStaticFunctionSelectors
    holdManagementFacet: IStaticFunctionSelectors
    holdTokenHolderFacet: IStaticFunctionSelectors
    proceedRecipientsFacet: IStaticFunctionSelectors
    externalPauseManagementFacet: IStaticFunctionSelectors
    externalControlListManagementFacet: IStaticFunctionSelectors
    externalKycListManagementFacet: IStaticFunctionSelectors
    freezeFacet: IStaticFunctionSelectors
    ERC3643Management: IStaticFunctionSelectors
    ERC3643Operations: IStaticFunctionSelectors
    ERC3643Read: IStaticFunctionSelectors
    ERC3643BatchFacet: IStaticFunctionSelectors
}

export let businessLogicResolver: IBusinessLogicResolver

export async function deployProxyForBusinessLogicResolver({
    businessLogicResolverImplementationAddress,
    proxyAdminAddress,
    signer,
    overrides,
}: DeployProxyForBusinessLogicResolverCommand) {
    const deployProxyCommand = new DeployContractWithFactoryCommand({
        factory: new BusinessLogicResolver__factory(),
        withProxy: true,
        deployedContract: {
            address: businessLogicResolverImplementationAddress,
            proxyAdminAddress: proxyAdminAddress,
        },
        signer,
        overrides,
    })
    const { contract: businessLogicResolver } =
        await deployContractWithFactory(deployProxyCommand)

    const txResponse =
        await businessLogicResolver.initialize_BusinessLogicResolver({
            gasLimit: GAS_LIMIT.initialize.businessLogicResolver,
        })
    validateTxResponse(
        new ValidateTxResponseCommand({
            txResponse: txResponse,
            errorMessage: MESSAGES.businessLogicResolver.error.initializing,
        })
    )
}

function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function uncapitalizeFirst(str: string) {
    return str.charAt(0).toLowerCase() + str.slice(1)
}

export async function getFacetsByConfigurationIdAndVersion({
    businessLogicResolverAddress,
    configurationId,
    provider,
    overrides,
}: GetFacetsByConfigurationIdAndVersionQuery): Promise<GetFacetsByConfigurationIdAndVersionResult> {
    const diamondCutManager = IDiamondCutManager__factory.connect(
        businessLogicResolverAddress,
        provider
    )
    const latestConfigVersionRaw =
        await diamondCutManager.getLatestVersionByConfiguration(
            configurationId,
            overrides
        )

    const lastestConfigVersion = parseInt(
        latestConfigVersionRaw.toHexString(),
        16
    )

    console.log(
        `Number of Versions for Config ${configurationId}: ${lastestConfigVersion}`
    )

    const result = new GetFacetsByConfigurationIdAndVersionResult({
        facetListRecord: [],
    })
    for (
        let currentVersion = 1;
        currentVersion <= lastestConfigVersion;
        currentVersion++
    ) {
        const facetListLengthRaw =
            await diamondCutManager.getFacetsLengthByConfigurationIdAndVersion(
                configurationId,
                currentVersion,
                overrides
            )
        const facetListLength = parseInt(facetListLengthRaw.toHexString(), 16)

        result.facetListRecord[currentVersion] =
            await diamondCutManager.getFacetsByConfigurationIdAndVersion(
                configurationId,
                currentVersion,
                0,
                facetListLength,
                overrides
            )
    }
    return result
}

export async function deployBusinessLogics(
    deployedAndRegisteredBusinessLogics: DeployedBusinessLogics
) {
    async function deployContractAndAssignIt(
        deployedAndRegisteredBusinessLogics: DeployedBusinessLogics,
        contractToDeploy: string
    ) {
        async function deployContract() {
            return await (await getContractFactory(contractToDeploy)).deploy()
        }
        const deployedContract = await deployContract()
        const deployedAndRegisteredBusinessLogics_Property =
            uncapitalizeFirst(contractToDeploy)
        deployedAndRegisteredBusinessLogics[
            deployedAndRegisteredBusinessLogics_Property as keyof DeployedBusinessLogics
        ] = IStaticFunctionSelectors__factory.connect(
            deployedContract.address,
            deployedContract.signer
        )
    }
    let key: keyof typeof deployedAndRegisteredBusinessLogics
    for (key in deployedAndRegisteredBusinessLogics) {
        await deployContractAndAssignIt(
            deployedAndRegisteredBusinessLogics,
            capitalizeFirst(key)
        )
    }
}

export async function registerDeployedContractBusinessLogics({
    deployedContractAddressList,
    businessLogicResolverProxyAddress,
    signer,
    overrides,
}: RegisterDeployedContractBusinessLogicsCommand) {
    const registerBusinessLogicsCommand = new RegisterBusinessLogicsCommand({
        contractAddressList: deployedContractAddressList,
        businessLogicResolverProxyAddress,
        signer,
        overrides,
    })
    await registerBusinessLogics(registerBusinessLogicsCommand)
}

/**
 * Registers business logic contracts with a resolver.
 *
 * This function performs the following steps:
 * 1. Gets business logic keys from each contract in the provided address list
 * 2. Creates registry data objects containing keys and addresses
 * 3. Registers the business logics with the resolver contract
 * 4. Validates the transaction response
 *
 * @param deployedContractAddressList - Object containing addresses of deployed contracts to register
 * @param businessLogicResolver - Address of the business logic resolver contract
 * @param signer - Ethereum signer to execute transactions
 *
 * @throws Will throw an error if registration transaction fails validation
 *
 * @remarks
 * Each contract in the address list must implement the IStaticFunctionSelectors interface
 */
export async function registerBusinessLogics({
    contractAddressListToRegister,
    businessLogicResolverProxyAddress,
    signer,
    overrides,
}: RegisterBusinessLogicsCommand): Promise<void> {
    const businessLogicRegistries: BusinessLogicRegistryData[] =
        await Promise.all(
            Object.values(contractAddressListToRegister).map(
                async (address) => {
                    const proxiedContract =
                        IStaticFunctionSelectors__factory.connect(
                            address,
                            signer
                        )
                    const businessLogicKey =
                        await proxiedContract.getStaticResolverKey()

                    return {
                        businessLogicKey,
                        businessLogicAddress: address.replace('0x', ''),
                    }
                }
            )
        )

    const resolverContract = IBusinessLogicResolver__factory.connect(
        businessLogicResolverProxyAddress,
        signer
    )
    const response = await resolverContract.registerBusinessLogics(
        businessLogicRegistries,
        {
            gasLimit: GAS_LIMIT.businessLogicResolver.registerBusinessLogics,
            ...overrides,
        }
    )
    await validateTxResponse(
        new ValidateTxResponseCommand({
            txResponse: response,
            confirmationEvent: EVENTS.businessLogicResolver.registered,
            errorMessage: MESSAGES.businessLogicResolver.error.registering,
        })
    )
}

function createFacetConfigurations(
    ids: string[],
    versions: number[]
): FacetConfiguration[] {
    return ids.map((id, index) => ({ id, version: versions[index] }))
}

async function sendBatchConfiguration(
    configId: string,
    configurations: FacetConfiguration[],
    isFinalBatch: boolean,
    businessLogicResolverProxyAddress: string,
    signer: Signer
): Promise<void> {
    const txResponse = await IDiamondCutManager__factory.connect(
        businessLogicResolverProxyAddress,
        signer
    ).createBatchConfiguration(configId, configurations, isFinalBatch, {
        gasLimit: GAS_LIMIT.businessLogicResolver.createConfiguration,
    })

    await validateTxResponse(
        new ValidateTxResponseCommand({
            txResponse,
            confirmationEvent:
                EVENTS.businessLogicResolver.configurationCreated,
            errorMessage:
                MESSAGES.businessLogicResolver.error.creatingConfigurations,
        })
    )
}

async function processFacetLists(
    configId: string,
    facetIdList: string[],
    facetVersionList: number[],
    businessLogicResolverProxyAddress: string,
    signer: Signer,
    partialBatchDeploy: boolean
): Promise<void> {
    if (facetIdList.length !== facetVersionList.length) {
        throw new Error(
            'facetIdList and facetVersionList must have the same length'
        )
    }
    const batchSize = Math.ceil(facetIdList.length / 2)

    for (let i = 0; i < facetIdList.length; i += batchSize) {
        // delay to prevent errors in RPC from too many calls
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const batchIds = facetIdList.slice(i, i + batchSize)
        const batchVersions = facetVersionList.slice(i, i + batchSize)
        const batch = createFacetConfigurations(batchIds, batchVersions)

        const isLastBatch = partialBatchDeploy
            ? false
            : i + batchSize >= facetIdList.length

        await sendBatchConfiguration(
            configId,
            batch,
            isLastBatch,
            businessLogicResolverProxyAddress,
            signer
        )
    }
}

export async function createConfigurationsForDeployedContracts(
    partialBatchDeploy: boolean,
    {
        commonFacetAddressList,
        equityFacetAddressList,
        bondFacetAddressList,
        businessLogicResolverProxyAddress,
        signer,
    }: CreateConfigurationsForDeployedContractsCommand
): Promise<CreateConfigurationsForDeployedContractsResult> {
    const result = CreateConfigurationsForDeployedContractsResult.empty()

    await fetchFacetResolverKeys(
        result,
        signer,
        commonFacetAddressList,
        equityFacetAddressList,
        bondFacetAddressList
    )

    await processFacetLists(
        EQUITY_CONFIG_ID,
        result.equityFacetIdList,
        result.equityFacetVersionList,
        businessLogicResolverProxyAddress,
        signer,
        partialBatchDeploy
    )
    await processFacetLists(
        BOND_CONFIG_ID,
        result.bondFacetIdList,
        result.bondFacetVersionList,
        businessLogicResolverProxyAddress,
        signer,
        partialBatchDeploy
    )
    return result
}

async function fetchFacetResolverKeys(
    result: CreateConfigurationsForDeployedContractsResult,
    signer: Signer,
    commonFacetAddressList: string[],
    equityFacetAddressList: string[],
    bondFacetAddressList: string[]
): Promise<void> {
    const resolverKeyMap = new Map<string, string>()

    result.commonFacetIdList = await Promise.all(
        commonFacetAddressList.map((address) =>
            getResolverKey(address, signer, resolverKeyMap)
        )
    )
    result.equityFacetIdList = await Promise.all(
        equityFacetAddressList.map((address) =>
            getResolverKey(address, signer, resolverKeyMap)
        )
    )
    result.bondFacetIdList = await Promise.all(
        bondFacetAddressList.map((address) =>
            getResolverKey(address, signer, resolverKeyMap)
        )
    )

    result.equityFacetVersionList = Array(result.equityFacetIdList.length).fill(
        1
    )
    result.bondFacetVersionList = Array(result.bondFacetIdList.length).fill(1)
}

async function getResolverKey(
    address: string,
    signer: Signer,
    keyMap: Map<string, string>
): Promise<string> {
    if (!keyMap.has(address)) {
        const key = await IStaticFunctionSelectors__factory.connect(
            address,
            signer
        ).getStaticResolverKey()
        keyMap.set(address, key)
    }
    return keyMap.get(address)!
}
