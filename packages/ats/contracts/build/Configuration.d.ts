export declare const NETWORKS: readonly ["hardhat", "local", "previewnet", "testnet", "mainnet"];
export type Network = (typeof NETWORKS)[number];
export declare const DEPLOY_TYPES: readonly ["proxy", "direct"];
export type DeployType = (typeof DEPLOY_TYPES)[number];
export declare const CONTRACT_NAMES: readonly ["TransparentUpgradeableProxy", "ProxyAdmin", "Factory", "BusinessLogicResolver", "AccessControlFacet", "Cap", "ControlList", "PauseFacet", "ERC20", "ERC20Permit", "ERC1410ScheduledTasks", "ERC1410ReadFacet", "ERC1410ManagementFacet", "ERC1410TokenHolderFacet", "ERC1594", "ERC1643", "ERC1644", "DiamondFacet", "EquityUSA", "BondUSA", "ScheduledSnapshots", "ScheduledBalanceAdjustments", "ScheduledTasks", "Snapshots", "CorporateActions", "TransferAndLock", "Lock", "AdjustBalances", "ProtectedPartitions", "HoldReadFacet", "HoldTokenHolderFacet", "HoldManagementFacet", "TimeTravel", "Kyc", "SsiManagement", "ClearingHoldCreationFacet", "ClearingRedeemFacet", "ClearingTransferFacet", "ClearingReadFacet", "ClearingActionsFacet", "ExternalPauseManagement", "ExternalControlListManagement", "ExternalKycListManagement", "ERC3643", "FreezeFacet", "ERC3643Facet", "ERC3643BatchFacet", "FreezeFacet", "ComplianceMock", "IdentityRegistryMock", "TREXFactoryAts"];
export type ContractName = (typeof CONTRACT_NAMES)[number];
export declare const LIBRARY_NAMES: string[];
export type LibraryName = (typeof LIBRARY_NAMES)[number];
export declare const CONTRACT_NAMES_WITH_PROXY: string[];
export declare const CONTRACT_FACTORY_NAMES: string[];
export type ContractFactoryName = (typeof CONTRACT_FACTORY_NAMES)[number];
export interface Endpoints {
    jsonRpc: string;
    mirror: string;
}
export interface DeployedContract {
    address: string;
    proxyAddress?: string;
    proxyAdminAddress?: string;
}
export interface ContractConfig {
    name: ContractName;
    factoryName: ContractFactoryName;
    deployType: DeployType;
    addresses?: Record<Network, DeployedContract>;
}
export default class Configuration {
    /**
     * Determines whether the contract sizer should run on compile.
     *
     * @returns {boolean} True if the contract sizer should run on compile, false otherwise.
     */
    static get contractSizerRunOnCompile(): boolean;
    /**
     * Determines whether gas reporting is enabled.
     *
     * @returns {boolean} True if gas reporting is enabled, false otherwise.
     */
    static get reportGas(): boolean;
    static get privateKeys(): Record<Network, string[]>;
    static get endpoints(): Record<Network, Endpoints>;
    static get contracts(): Record<ContractName, ContractConfig>;
    /**
     * Retrieves the deployed contract addresses for a given contract name across different networks.
     *
     * @param {Object} params - The parameters object.
     * @param {ContractName} params.contractName - The name of the contract to get deployed addresses for.
     * @returns {Record<Network, DeployedContract>} An object mapping each network to its deployed contract details.
     *
     * The function iterates over all available networks and fetches the contract address, proxy address,
     * and proxy admin address from environment variables. If the contract address is found, it adds the
     * details to the returned object.
     */
    private static _getDeployedAddresses;
    private static _getEnvironmentVariableList;
    private static _getEnvironmentVariable;
}
