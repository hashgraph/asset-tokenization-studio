// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { IAsset__factory } from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import LogService from "@service/log/LogService";
import { encodeBytes32String, toUtf8Bytes } from "ethers";
import { TransactionExecutor } from "../TransactionExecutor";

export class CustomDataOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async setCustomData(
    security: EvmAddress,
    key: string,
    value: string[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting custom data for security: ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      IAsset__factory.createInterface(),
      "setCustomData",
      [encodeBytes32String(key), value.map((v) => toUtf8Bytes(v))],
      GAS.SET_CUSTOM_DATA,
    );
  }
}
