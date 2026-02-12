// SPDX-License-Identifier: Apache-2.0

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

export interface GetSignerResult {
  signer: HardhatEthersSigner;
  address: string;
  privateKey: string;
}

interface WithSigner {
  privateKey?: string;
  signerAddress?: string;
  signerPosition?: number;
}

export type GetSignerArgs = WithSigner;

// * Utils

export interface Keccak256Args {
  input: string;
}

export interface CreateVcArgs {
  holder: string;
  privatekey: string;
}

// * Deploy
export interface DeployArgs extends WithSigner {
  contractName: string;
}

export interface DeployAllArgs extends WithSigner {
  useDeployed: boolean;
  fileName: string;
}

export interface DeployTrexFactoryArgs extends WithSigner {
  atsFactory?: string;
  implementationAuthority?: string;
  idFactory?: string;
  resolver?: string;
}

// * Transparent Upgradeable Proxy
export interface GetProxyAdminConfigArgs {
  proxyAdmin: string;
  proxy: string;
}

export interface UpdateFactoryVersionArgs extends WithSigner {
  proxyAdminAddress: string;
  transparentProxyAddress: string;
  newImplementationAddress: string;
}

// * Business Logic Resolver
export interface GetConfigurationInfoArgs {
  resolver: string;
  configurationId: string;
}

export interface GetResolverBusinessLogicsArgs {
  resolver: string;
}

export interface UpdateBusinessLogicKeysArgs extends WithSigner {
  resolverAddress: string;
  implementationAddressList: string; // * Comma separated list
}
