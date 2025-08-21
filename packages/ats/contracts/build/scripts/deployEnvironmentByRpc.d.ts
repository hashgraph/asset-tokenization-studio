import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { IBusinessLogicResolver, IFactory, ProxyAdmin } from '@typechain';
import { DeployedBusinessLogics } from '@scripts';
export interface Environment {
    deployedBusinessLogics: DeployedBusinessLogics;
    facetIdsEquities: string[];
    facetVersionsEquities: number[];
    facetIdsBonds: string[];
    facetVersionsBonds: number[];
    proxyAdmin: ProxyAdmin;
    resolver: IBusinessLogicResolver;
    factory: IFactory;
}
export declare const environment: Environment;
export declare function deployEnvironment({ signer, timeTravelEnabled, }: {
    signer: SignerWithAddress;
    timeTravelEnabled?: boolean;
}): Promise<void>;
