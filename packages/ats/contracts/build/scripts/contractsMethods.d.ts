import { Client, ContractId } from '@hashgraph/sdk';
export declare function getProxyImplementation(proxyAdminAddress: ContractId, client: Client, proxyAddress: string): Promise<string>;
export declare function getOwner(proxyAdminAddress: ContractId, client: Client): Promise<string>;
export interface BusinessLogicRegistryData {
    businessLogicKey: string;
    businessLogicAddress: string;
}
export declare function registerBusinessLogics(businessLogicRegistryData: BusinessLogicRegistryData[], proxyAddress: ContractId, client: Client): Promise<void>;
export declare function createConfiguration(configId: string, facetIds: string[], facetVersions: number[], proxyAddress: ContractId, client: Client): Promise<void>;
export declare function getConfigurationsLength(proxyAddress: ContractId, client: Client): Promise<any>;
export declare function getLatestVersionByConfiguration(configId: string, proxyAddress: ContractId, client: Client): Promise<any>;
export declare function getFacetsLengthByConfigurationIdAndVersion(configId: string, version: number, proxyAddress: ContractId, client: Client): Promise<any>;
export declare function getFacetsByConfigurationIdAndVersion(configId: string, version: number, pageIndex: number, pageLength: number, proxyAddress: ContractId, client: Client): Promise<any>;
export declare function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(configId: string, version: number, facet: string, proxyAddress: ContractId, client: Client): Promise<any>;
export declare function getFacetSelectorsByConfigurationIdVersionAndFacetId(configId: string, version: number, facet: string, pageIndex: number, pageLength: number, proxyAddress: ContractId, client: Client): Promise<any>;
export declare function getBusinessLogicKeys(proxyAddress: ContractId, client: Client): Promise<any>;
export declare function getStaticResolverKey(facetAddress: ContractId, client: Client): Promise<any>;
export declare function getSolidityAddress(facet: ContractId): string;
