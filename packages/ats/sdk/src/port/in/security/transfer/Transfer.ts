// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import {
  BatchForcedTransferRequest,
  BatchTransferRequest,
  ForcedTransferRequest,
  ForceTransferRequest,
  ProtectedTransferFromByPartitionRequest,
  TransferAndLockRequest,
  TransferRequest,
} from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { TransferCommand } from "@command/security/operations/transfer/TransferCommand";
import { TransferAndLockCommand } from "@command/security/operations/transfer/TransferAndLockCommand";
import { ControllerTransferCommand } from "@command/security/operations/transfer/ControllerTransferCommand";
import { ForcedTransferCommand } from "@command/security/operations/transfer/ForcedTransferCommand";
import { BatchTransferCommand } from "@command/security/operations/batch/batchTransfer/BatchTransferCommand";
import { BatchForcedTransferCommand } from "@command/security/operations/batch/batchForcedTransfer/BatchForcedTransferCommand";
import { ProtectedTransferFromByPartitionCommand } from "@command/security/operations/transfer/ProtectedTransferFromByPartitionCommand";
import { BaseSecurityInPort } from "../BaseSecurityInPort";

export interface ISecurityInPortTransfer {
  transfer(request: TransferRequest): Promise<{ payload: boolean; transactionId: string }>;
  transferAndLock(request: TransferAndLockRequest): Promise<{ payload: number; transactionId: string }>;
  controllerTransfer(request: ForceTransferRequest): Promise<{ payload: boolean; transactionId: string }>;
  forcedTransfer(request: ForcedTransferRequest): Promise<{ payload: boolean; transactionId: string }>;
  batchTransfer(request: BatchTransferRequest): Promise<{ payload: boolean; transactionId: string }>;
  batchForcedTransfer(request: BatchForcedTransferRequest): Promise<{ payload: boolean; transactionId: string }>;
  protectedTransferFromByPartition(
    request: ProtectedTransferFromByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
}

export class SecurityInPortTransfer extends BaseSecurityInPort implements ISecurityInPortTransfer {
  @LogError
  async transfer(request: TransferRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId } = request;
    ValidatedRequest.handleValidation("TransferRequest", request);

    return await this.commandBus.execute(new TransferCommand(amount, targetId, securityId));
  }

  @LogError
  async transferAndLock(request: TransferAndLockRequest): Promise<{ payload: number; transactionId: string }> {
    const { securityId, amount, targetId, expirationDate } = request;
    ValidatedRequest.handleValidation("TransferAndLockRequest", request);

    return await this.commandBus.execute(new TransferAndLockCommand(amount, targetId, securityId, expirationDate));
  }

  @LogError
  async controllerTransfer(request: ForceTransferRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId, sourceId } = request;
    ValidatedRequest.handleValidation("ForceTransferRequest", request);

    return await this.commandBus.execute(new ControllerTransferCommand(amount, sourceId, targetId, securityId));
  }

  @LogError
  async forcedTransfer(request: ForcedTransferRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId, sourceId } = request;
    ValidatedRequest.handleValidation("ForcedTransferRequest", request);

    return await this.commandBus.execute(new ForcedTransferCommand(sourceId, targetId, amount, securityId));
  }

  @LogError
  async batchTransfer(request: BatchTransferRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("BatchTransferRequest", request);
    return await this.commandBus.execute(
      new BatchTransferCommand(request.securityId, request.amountList, request.toList),
    );
  }
  @LogError
  async batchForcedTransfer(request: BatchForcedTransferRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("BatchForcedTransferRequest", request);
    return await this.commandBus.execute(
      new BatchForcedTransferCommand(request.securityId, request.amountList, request.fromList, request.toList),
    );
  }

  @LogError
  async protectedTransferFromByPartition(
    request: ProtectedTransferFromByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, partitionId, sourceId, targetId, amount, deadline, nounce, signature } = request;
    ValidatedRequest.handleValidation("ProtectedTransferFromByPartitionRequest", request);

    return await this.commandBus.execute(
      new ProtectedTransferFromByPartitionCommand(
        securityId,
        partitionId,
        sourceId,
        targetId,
        amount,
        deadline,
        nounce,
        signature,
      ),
    );
  }
}
