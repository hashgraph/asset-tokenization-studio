// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import {
  AccessControlFacet__factory,
  ERC1410TokenHolderFacet__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class RoleOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async grantRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Granting role ${role.toString()} to account: ${targetId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(AccessControlFacet__factory.abi as ethers.InterfaceAbi),
      "grantRole",
      [role, targetId.toString()],
      GAS.GRANT_ROLES,
    );
  }

  async applyRoles(
    security: EvmAddress,
    targetId: EvmAddress,
    roles: SecurityRole[],
    actives: boolean[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    let gas = roles.length * GAS.GRANT_ROLES;
    gas = gas > GAS.MAX_ROLES ? GAS.MAX_ROLES : gas;
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(AccessControlFacet__factory.abi as ethers.InterfaceAbi),
      "applyRoles",
      [roles, actives, targetId.toString()],
      gas,
    );
  }

  async revokeRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Revoking role ${role.toString()} to account: ${targetId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(AccessControlFacet__factory.abi as ethers.InterfaceAbi),
      "revokeRole",
      [role, targetId.toString()],
      GAS.GRANT_ROLES,
    );
  }

  async renounceRole(
    security: EvmAddress,
    role: SecurityRole,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Renounce role ${role.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(AccessControlFacet__factory.abi as ethers.InterfaceAbi),
      "renounceRole",
      [role],
      GAS.RENOUNCE_ROLES,
    );
  }

  async authorizeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`authorizing operator: ${targetId.toString()} for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410TokenHolderFacet__factory.createInterface(),
      "authorizeOperator",
      [targetId.toString()],
      GAS.AUTHORIZE_OPERATOR,
    );
  }

  async revokeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`revoking operator: ${targetId.toString()} for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410TokenHolderFacet__factory.createInterface(),
      "revokeOperator",
      [targetId.toString()],
      GAS.REVOKE_OPERATOR,
    );
  }

  async authorizeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `authorizing operator: ${targetId.toString()} for security ${security.toString()} and partition ${partitionId}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410TokenHolderFacet__factory.createInterface(),
      "authorizeOperatorByPartition",
      [partitionId, targetId.toString()],
      GAS.AUTHORIZE_OPERATOR,
    );
  }

  async revokeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `revoking operator: ${targetId.toString()} for security ${security.toString()} and partition ${partitionId}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410TokenHolderFacet__factory.createInterface(),
      "revokeOperatorByPartition",
      [partitionId, targetId.toString()],
      GAS.REVOKE_OPERATOR,
    );
  }
}
