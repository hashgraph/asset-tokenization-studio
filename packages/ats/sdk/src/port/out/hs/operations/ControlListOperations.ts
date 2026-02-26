// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import {
  ControlListFacet__factory,
  ExternalControlListManagementFacet__factory,
  MockedBlacklist__factory,
  MockedWhitelist__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class ControlListOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async addToControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding account ${targetId.toString()} to a control list`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ControlListFacet__factory.createInterface(),
      "addToControlList",
      [targetId.toString()],
      GAS.ADD_TO_CONTROL_LIST,
    );
  }

  async removeFromControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing account ${targetId.toString()} from a control list`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ControlListFacet__factory.createInterface(),
      "removeFromControlList",
      [targetId.toString()],
      GAS.REMOVE_FROM_CONTROL_LIST,
    );
  }

  async updateExternalControlLists(
    security: EvmAddress,
    externalControlListsAddresses: EvmAddress[],
    actives: boolean[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating External Control Lists for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ExternalControlListManagementFacet__factory.createInterface(),
      "updateExternalControlLists",
      [externalControlListsAddresses.map((address) => address.toString()), actives],
      GAS.UPDATE_EXTERNAL_CONTROL_LISTS,
    );
  }

  async addExternalControlList(
    security: EvmAddress,
    externalControlListAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding External Control Lists for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ExternalControlListManagementFacet__factory.createInterface(),
      "addExternalControlList",
      [externalControlListAddress.toString()],
      GAS.ADD_EXTERNAL_CONTROL_LIST,
    );
  }

  async removeExternalControlList(
    security: EvmAddress,
    externalControlListAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing External Control Lists for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ExternalControlListManagementFacet__factory.createInterface(),
      "removeExternalControlList",
      [externalControlListAddress.toString()],
      GAS.REMOVE_EXTERNAL_CONTROL_LIST,
    );
  }

  async addToBlackListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Adding address ${targetId.toString()} to external Control black List mock ${contract.toString()}`,
    );
    return this.executor.executeContractCall(
      contractId.toString(),
      MockedBlacklist__factory.createInterface(),
      "addToBlacklist",
      [targetId.toString()],
      GAS.ADD_TO_BLACK_LIST_MOCK,
    );
  }

  async addToWhiteListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Adding address ${targetId.toString()} to external Control white List mock ${contract.toString()}`,
    );
    return this.executor.executeContractCall(
      contractId.toString(),
      MockedWhitelist__factory.createInterface(),
      "addToWhitelist",
      [targetId.toString()],
      GAS.ADD_TO_WHITE_LIST_MOCK,
    );
  }

  async removeFromBlackListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Removing address ${targetId.toString()} from external Control black List mock ${contract.toString()}`,
    );
    return this.executor.executeContractCall(
      contractId.toString(),
      MockedBlacklist__factory.createInterface(),
      "removeFromBlacklist",
      [targetId.toString()],
      GAS.REMOVE_FROM_BLACK_LIST_MOCK,
    );
  }

  async removeFromWhiteListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Removing address ${targetId.toString()} from external Control white List mock ${contract.toString()}`,
    );
    return this.executor.executeContractCall(
      contractId.toString(),
      MockedWhitelist__factory.createInterface(),
      "removeFromWhitelist",
      [targetId.toString()],
      GAS.REMOVE_FROM_WHITE_LIST_MOCK,
    );
  }

  async createExternalBlackListMock(): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying External Control Black List Mock contract`);
    return this.executor.deployContract(MockedBlacklist__factory.bytecode, GAS.CREATE_EXTERNAL_BLACK_LIST_MOCK);
  }

  async createExternalWhiteListMock(): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying External Control White List Mock contract`);
    return this.executor.deployContract(MockedWhitelist__factory.bytecode, GAS.CREATE_EXTERNAL_WHITE_LIST_MOCK);
  }
}
