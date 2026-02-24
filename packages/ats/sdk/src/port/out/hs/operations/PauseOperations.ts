// SPDX-License-Identifier: Apache-2.0

import { ContractCreateTransaction, ContractId } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import {
  ExternalPauseManagementFacet__factory,
  MockedExternalPause__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import LogService from "@service/log/LogService";
import { TransactionType } from "@port/out/TransactionResponseEnums";
import { TransactionExecutor } from "../TransactionExecutor";

export class PauseOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async pause(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Pausing security: ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(["function pause()"]),
      "pause",
      [],
      GAS.PAUSE,
    );
  }

  async unpause(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Unpausing security: ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(["function unpause()"]),
      "unpause",
      [],
      GAS.PAUSE,
    );
  }

  async updateExternalPauses(
    security: EvmAddress,
    externalPausesAddresses: EvmAddress[],
    actives: boolean[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating External Pauses for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ExternalPauseManagementFacet__factory.createInterface(),
      "updateExternalPauses",
      [externalPausesAddresses.map((address) => address.toString()), actives],
      GAS.UPDATE_EXTERNAL_PAUSES,
    );
  }

  async addExternalPause(
    security: EvmAddress,
    externalPauseAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding External Pause for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ExternalPauseManagementFacet__factory.createInterface(),
      "addExternalPause",
      [externalPauseAddress.toString()],
      GAS.ADD_EXTERNAL_PAUSE,
    );
  }

  async removeExternalPause(
    security: EvmAddress,
    externalPauseAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing External Pause for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ExternalPauseManagementFacet__factory.createInterface(),
      "removeExternalPause",
      [externalPauseAddress.toString()],
      GAS.REMOVE_EXTERNAL_PAUSE,
    );
  }

  async setPausedMock(
    contract: EvmAddress,
    paused: boolean,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting paused to external pause mock contract ${contract.toString()}`);
    return this.executor.executeContractCall(
      contractId.toString(),
      MockedExternalPause__factory.createInterface(),
      "setPaused",
      [paused],
      GAS.SET_PAUSED_MOCK,
    );
  }

  async createExternalPauseMock(): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying External Pause Mock contract`);
    const bytecodeHex = MockedExternalPause__factory.bytecode.startsWith("0x")
      ? MockedExternalPause__factory.bytecode.slice(2)
      : MockedExternalPause__factory.bytecode;
    const bytecode = Uint8Array.from(Buffer.from(bytecodeHex, "hex"));
    const contractCreate = new ContractCreateTransaction()
      .setBytecode(bytecode)
      .setGas(GAS.CREATE_EXTERNAL_PAUSE_MOCK);
    return this.executor.processTransaction(contractCreate, TransactionType.RECEIPT);
  }
}
