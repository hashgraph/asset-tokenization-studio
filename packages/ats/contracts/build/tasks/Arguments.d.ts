import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
export interface GetSignerResult {
    signer: SignerWithAddress;
    address: string;
    privateKey: string;
}
interface WithSigner {
    privateKey?: string;
    signerAddress?: string;
    signerPosition?: number;
}
export type GetSignerArgs = WithSigner;
export interface Keccak256Args {
    input: string;
}
export interface CreateVcArgs {
    holder: string;
    privatekey: string;
}
export interface DeployArgs extends WithSigner {
    contractName: string;
}
export interface DeployAllArgs extends WithSigner {
    useDeployed: boolean;
    fileName: string;
}
export interface DeployTrexFactoryArgs extends WithSigner {
    atsFactory?: string;
    resolver?: string;
}
export interface GetProxyAdminConfigArgs {
    proxyAdmin: string;
    proxy: string;
}
export interface UpdateFactoryVersionArgs extends WithSigner {
    proxyAdminAddress: string;
    transparentProxyAddress: string;
    newImplementationAddress: string;
}
export interface GetConfigurationInfoArgs {
    resolver: string;
    configurationId: string;
}
export interface GetResolverBusinessLogicsArgs {
    resolver: string;
}
export interface UpdateBusinessLogicKeysArgs extends WithSigner {
    resolverAddress: string;
    implementationAddressList: string;
}
export {};
