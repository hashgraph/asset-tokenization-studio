import { Environment } from './deployEnvironmentByRpc';
export interface FacetConfiguration {
    id: string;
    version: number;
}
export declare function createResolverConfig(environment: Environment, configId: string, facetIds: string[], facetVersions: number[]): Promise<number>;
