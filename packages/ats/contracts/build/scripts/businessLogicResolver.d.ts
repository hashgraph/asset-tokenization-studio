import { IBusinessLogicResolver } from '@typechain';
import { IStaticFunctionSelectors } from '@typechain';
import { CreateConfigurationsForDeployedContractsCommand, CreateConfigurationsForDeployedContractsResult, DeployProxyForBusinessLogicResolverCommand, GetFacetsByConfigurationIdAndVersionQuery, GetFacetsByConfigurationIdAndVersionResult, RegisterBusinessLogicsCommand, RegisterDeployedContractBusinessLogicsCommand } from '@scripts';
export interface BusinessLogicRegistryData {
    businessLogicKey: string;
    businessLogicAddress: string;
}
export interface DeployedBusinessLogics {
    businessLogicResolver: IStaticFunctionSelectors;
    factory: IStaticFunctionSelectors;
    diamondFacet: IStaticFunctionSelectors;
    accessControl: IStaticFunctionSelectors;
    controlList: IStaticFunctionSelectors;
    kyc: IStaticFunctionSelectors;
    ssiManagement: IStaticFunctionSelectors;
    corporateActions: IStaticFunctionSelectors;
    pause: IStaticFunctionSelectors;
    ERC20: IStaticFunctionSelectors;
    ERC20Permit: IStaticFunctionSelectors;
    ERC1644: IStaticFunctionSelectors;
    erc1410ReadFacet: IStaticFunctionSelectors;
    erc1410ManagementFacet: IStaticFunctionSelectors;
    erc1410TokenHolderFacet: IStaticFunctionSelectors;
    ERC1594: IStaticFunctionSelectors;
    ERC1643: IStaticFunctionSelectors;
    equityUSA: IStaticFunctionSelectors;
    bondUSA: IStaticFunctionSelectors;
    Snapshots: IStaticFunctionSelectors;
    scheduledSnapshots: IStaticFunctionSelectors;
    scheduledBalanceAdjustments: IStaticFunctionSelectors;
    scheduledTasks: IStaticFunctionSelectors;
    Cap: IStaticFunctionSelectors;
    Lock: IStaticFunctionSelectors;
    transferAndLock: IStaticFunctionSelectors;
    adjustBalances: IStaticFunctionSelectors;
    protectedPartitions: IStaticFunctionSelectors;
    holdReadFacet: IStaticFunctionSelectors;
    holdManagementFacet: IStaticFunctionSelectors;
    holdTokenHolderFacet: IStaticFunctionSelectors;
    externalPauseManagement: IStaticFunctionSelectors;
    externalControlListManagement: IStaticFunctionSelectors;
    externalKycListManagement: IStaticFunctionSelectors;
    freeze: IStaticFunctionSelectors;
    ERC3643: IStaticFunctionSelectors;
    ERC3643Batch: IStaticFunctionSelectors;
}
export declare let businessLogicResolver: IBusinessLogicResolver;
export declare function deployProxyForBusinessLogicResolver({ businessLogicResolverImplementationAddress, proxyAdminAddress, signer, overrides, }: DeployProxyForBusinessLogicResolverCommand): Promise<void>;
export declare function getFacetsByConfigurationIdAndVersion({ businessLogicResolverAddress, configurationId, provider, overrides, }: GetFacetsByConfigurationIdAndVersionQuery): Promise<GetFacetsByConfigurationIdAndVersionResult>;
export declare function deployBusinessLogics(deployedAndRegisteredBusinessLogics: DeployedBusinessLogics): Promise<void>;
export declare function registerDeployedContractBusinessLogics({ deployedContractAddressList, businessLogicResolverProxyAddress, signer, overrides, }: RegisterDeployedContractBusinessLogicsCommand): Promise<void>;
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
export declare function registerBusinessLogics({ contractAddressListToRegister, businessLogicResolverProxyAddress, signer, overrides, }: RegisterBusinessLogicsCommand): Promise<void>;
export declare function createConfigurationsForDeployedContracts(partialBatchDeploy: boolean, { commonFacetAddressList, equityFacetAddressList, bondFacetAddressList, businessLogicResolverProxyAddress, signer, }: CreateConfigurationsForDeployedContractsCommand): Promise<CreateConfigurationsForDeployedContractsResult>;
