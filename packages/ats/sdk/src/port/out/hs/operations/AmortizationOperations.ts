// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { IAsset__factory } from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class AmortizationOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async setAmortization(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    tokensToRedeem: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Setting amortization for security: ${security}, recordDate: ${recordDate}, executionDate: ${executionDate}, tokensToRedeem: ${tokensToRedeem}`,
    );
    const amortization = {
      recordDate: recordDate.toHexString(),
      executionDate: executionDate.toHexString(),
      tokensToRedeem: tokensToRedeem.toHexString(),
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      IAsset__factory.createInterface(),
      "setAmortization",
      [amortization],
      GAS.SET_AMORTIZATION,
    );
  }

  async cancelAmortization(
    security: EvmAddress,
    amortizationId: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Cancelling amortization: ${amortizationId} for security: ${security}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      IAsset__factory.createInterface(),
      "cancelAmortization",
      [amortizationId],
      GAS.CANCEL_AMORTIZATION,
    );
  }

  async setAmortizationHold(
    security: EvmAddress,
    amortizationId: number,
    tokenHolder: EvmAddress,
    tokenAmount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Setting amortization hold: security=${security}, amortizationId=${amortizationId}, tokenHolder=${tokenHolder}, tokenAmount=${tokenAmount}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      IAsset__factory.createInterface(),
      "setAmortizationHold",
      [amortizationId, tokenHolder.toString(), tokenAmount.toHexString()],
      GAS.SET_AMORTIZATION_HOLD,
    );
  }

  async releaseAmortizationHold(
    security: EvmAddress,
    amortizationId: number,
    tokenHolder: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Releasing amortization hold: security=${security}, amortizationId=${amortizationId}, tokenHolder=${tokenHolder}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      IAsset__factory.createInterface(),
      "releaseAmortizationHold",
      [amortizationId, tokenHolder.toString()],
      GAS.RELEASE_AMORTIZATION_HOLD,
    );
  }
}
