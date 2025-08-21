import { ContractReceipt } from 'ethers';
import { DeployProxyAdminCommand, DeployUpgradeableProxyCommand, ProxyImplementationQuery, UpgradeProxyImplementationCommand } from '@scripts';
export declare function deployProxyAdmin({ signer, overrides, }: DeployProxyAdminCommand): Promise<import("@scripts").DeployContractWithFactoryResult<import("@typechain").ProxyAdmin>>;
export declare function deployTransparentProxy({ proxyAdminAddress, implementationAddress, signer, overrides, }: DeployUpgradeableProxyCommand): Promise<import("@scripts").DeployContractWithFactoryResult<import("@typechain").TransparentUpgradeableProxy>>;
export declare function upgradeProxyImplementation({ proxyAdminAddress, transparentProxyAddress, newImplementationAddress, signer, overrides, }: UpgradeProxyImplementationCommand): Promise<ContractReceipt>;
export declare function proxyImplementation({ proxyAdminAddress, transparentProxyAddress, overrides, }: ProxyImplementationQuery): Promise<string>;
