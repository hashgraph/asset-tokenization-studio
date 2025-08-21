import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js';
import { type Pause, type AccessControl } from '@typechain';
export declare function grantRoleAndPauseToken(accessControlFacet: AccessControl, pauseFacet: Pause, role: string, signerAccessControl: SignerWithAddress, signerPause: SignerWithAddress, accountToAssignRole: string): Promise<void>;
export declare function assertObject(actual: any, expected: any, path?: string): void;
