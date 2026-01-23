// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import {
  BatchBurnRequest,
  BurnRequest,
  ForceRedeemRequest,
  ProtectedRedeemFromByPartitionRequest,
  RedeemRequest,
} from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { RedeemCommand } from "@command/security/operations/redeem/RedeemCommand";
import { BurnCommand } from "@command/security/operations/burn/BurnCommand";
import { ControllerRedeemCommand } from "@command/security/operations/redeem/ControllerRedeemCommand";
import { BatchBurnCommand } from "@command/security/operations/batch/batchBurn/BatchBurnCommand";
import { ProtectedRedeemFromByPartitionCommand } from "@command/security/operations/redeem/ProtectedRedeemFromByPartitionCommand";
import { BaseSecurityInPort } from "../BaseSecurityInPort";

export interface ISecurityInPortRedeem {
  redeem(request: RedeemRequest): Promise<{ payload: boolean; transactionId: string }>;
  burn(request: BurnRequest): Promise<{ payload: boolean; transactionId: string }>;
  controllerRedeem(request: ForceRedeemRequest): Promise<{ payload: boolean; transactionId: string }>;
  batchBurn(request: BatchBurnRequest): Promise<{ payload: boolean; transactionId: string }>;
  protectedRedeemFromByPartition(
    request: ProtectedRedeemFromByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
}

export class SecurityInPortRedeem extends BaseSecurityInPort implements ISecurityInPortRedeem {
  @LogError
  async redeem(request: RedeemRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount } = request;
    ValidatedRequest.handleValidation("RedeemRequest", request);

    return await this.commandBus.execute(new RedeemCommand(amount, securityId));
  }

  @LogError
  async burn(request: BurnRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, sourceId, amount } = request;
    ValidatedRequest.handleValidation("BurnRequest", request);

    return await this.commandBus.execute(new BurnCommand(sourceId, amount, securityId));
  }

  @LogError
  async controllerRedeem(request: ForceRedeemRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, sourceId } = request;
    ValidatedRequest.handleValidation("ForceRedeemRequest", request);

    return await this.commandBus.execute(new ControllerRedeemCommand(amount, sourceId, securityId));
  }

  @LogError
  async batchBurn(request: BatchBurnRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("BatchBurnRequest", request);
    return await this.commandBus.execute(
      new BatchBurnCommand(request.securityId, request.amountList, request.targetList),
    );
  }

  @LogError
  async protectedRedeemFromByPartition(
    request: ProtectedRedeemFromByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, sourceId, partitionId, deadline, nounce, signature } = request;
    ValidatedRequest.handleValidation("ProtectedRedeemFromByPartitionRequest", request);

    return await this.commandBus.execute(
      new ProtectedRedeemFromByPartitionCommand(securityId, partitionId, sourceId, amount, deadline, nounce, signature),
    );
  }
}
