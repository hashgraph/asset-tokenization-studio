// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import {
  ControllerCreateHoldByPartitionRequest,
  CreateHoldByPartitionRequest,
  CreateHoldFromByPartitionRequest,
  ExecuteHoldByPartitionRequest,
  GetHeldAmountForByPartitionRequest,
  GetHeldAmountForRequest,
  GetHoldCountForByPartitionRequest,
  GetHoldForByPartitionRequest,
  GetHoldsIdForByPartitionRequest,
  ProtectedCreateHoldByPartitionRequest,
  ReclaimHoldByPartitionRequest,
  ReleaseHoldByPartitionRequest,
} from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { CreateHoldByPartitionCommand } from "@command/security/operations/hold/createHoldByPartition/CreateHoldByPartitionCommand";
import { CreateHoldFromByPartitionCommand } from "@command/security/operations/hold/createHoldFromByPartition/CreateHoldFromByPartitionCommand";
import { ControllerCreateHoldByPartitionCommand } from "@command/security/operations/hold/controllerCreateHoldByPartition/ControllerCreateHoldByPartitionCommand";
import { ProtectedCreateHoldByPartitionCommand } from "@command/security/operations/hold/protectedCreateHoldByPartition/ProtectedCreateHoldByPartitionCommand";
import { GetHeldAmountForQuery } from "@query/security/hold/getHeldAmountFor/GetHeldAmountForQuery";
import { GetHeldAmountForByPartitionQuery } from "@query/security/hold/getHeldAmountForByPartition/GetHeldAmountForByPartitionQuery";
import { GetHoldCountForByPartitionQuery } from "@query/security/hold/getHoldCountForByPartition/GetHoldCountForByPartitionQuery";
import { GetHoldsIdForByPartitionQuery } from "@query/security/hold/getHoldsIdForByPartition/GetHoldsIdForByPartitionQuery";
import { HoldViewModel } from "../../response";
import { GetHoldForByPartitionQuery } from "@query/security/hold/getHoldForByPartition/GetHoldForByPartitionQuery";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import { ReleaseHoldByPartitionCommand } from "@command/security/operations/hold/releaseHoldByPartition/ReleaseHoldByPartitionCommand";
import { ReclaimHoldByPartitionCommand } from "@command/security/operations/hold/reclaimHoldByPartition/ReclaimHoldByPartitionCommand";
import { ExecuteHoldByPartitionCommand } from "@command/security/operations/hold/executeHoldByPartition/ExecuteHoldByPartitionCommand";
import { BaseSecurityInPort } from "../BaseSecurityInPort";

export interface ISecurityInPortHold {
  createHoldByPartition(request: CreateHoldByPartitionRequest): Promise<{ payload: number; transactionId: string }>;
  createHoldFromByPartition(
    request: CreateHoldFromByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  controllerCreateHoldByPartition(
    request: ControllerCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  protectedCreateHoldByPartition(
    request: ProtectedCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  getHeldAmountFor(request: GetHeldAmountForRequest): Promise<number>;
  getHeldAmountForByPartition(request: GetHeldAmountForByPartitionRequest): Promise<number>;
  getHoldCountForByPartition(request: GetHoldCountForByPartitionRequest): Promise<number>;
  getHoldsIdForByPartition(request: GetHoldsIdForByPartitionRequest): Promise<number[]>;
  getHoldForByPartition(request: GetHoldForByPartitionRequest): Promise<HoldViewModel>;
  releaseHoldByPartition(request: ReleaseHoldByPartitionRequest): Promise<{ payload: boolean; transactionId: string }>;
  reclaimHoldByPartition(request: ReclaimHoldByPartitionRequest): Promise<{ payload: boolean; transactionId: string }>;
  executeHoldByPartition(request: ExecuteHoldByPartitionRequest): Promise<{ payload: boolean; transactionId: string }>;
}

export class SecurityInPortHold extends BaseSecurityInPort implements ISecurityInPortHold {
  @LogError
  async createHoldByPartition(
    request: CreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    const { securityId, partitionId, amount, escrowId, targetId, expirationDate } = request;
    ValidatedRequest.handleValidation("CreateHoldByPartitionRequest", request);

    return await this.commandBus.execute(
      new CreateHoldByPartitionCommand(securityId, partitionId, escrowId, amount, targetId, expirationDate),
    );
  }

  @LogError
  async createHoldFromByPartition(
    request: CreateHoldFromByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    const { securityId, partitionId, amount, escrowId, sourceId, targetId, expirationDate } = request;
    ValidatedRequest.handleValidation("CreateHoldFromByPartitionRequest", request);
    return await this.commandBus.execute(
      new CreateHoldFromByPartitionCommand(
        securityId,
        partitionId,
        escrowId,
        amount,
        sourceId,
        targetId,
        expirationDate,
      ),
    );
  }

  @LogError
  async controllerCreateHoldByPartition(
    request: ControllerCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    const { securityId, partitionId, amount, escrowId, sourceId, targetId, expirationDate } = request;
    ValidatedRequest.handleValidation("ControllerCreateHoldByPartitionRequest", request);
    return await this.commandBus.execute(
      new ControllerCreateHoldByPartitionCommand(
        securityId,
        partitionId,
        escrowId,
        amount,
        sourceId,
        targetId,
        expirationDate,
      ),
    );
  }

  @LogError
  async protectedCreateHoldByPartition(
    request: ProtectedCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    const {
      securityId,
      partitionId,
      amount,
      escrowId,
      sourceId,
      targetId,
      expirationDate,
      deadline,
      nonce,
      signature,
    } = request;
    ValidatedRequest.handleValidation("ProtectedCreateHoldByPartitionRequest", request);
    return await this.commandBus.execute(
      new ProtectedCreateHoldByPartitionCommand(
        securityId,
        partitionId,
        escrowId,
        amount,
        sourceId,
        targetId,
        expirationDate,
        deadline,
        nonce,
        signature,
      ),
    );
  }

  @LogError
  async getHeldAmountFor(request: GetHeldAmountForRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetHeldAmountForRequest", request);

    return (await this.queryBus.execute(new GetHeldAmountForQuery(request.securityId, request.targetId))).payload;
  }

  @LogError
  async getHeldAmountForByPartition(request: GetHeldAmountForByPartitionRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetHeldAmountForByPartitionRequest", request);

    return (
      await this.queryBus.execute(
        new GetHeldAmountForByPartitionQuery(request.securityId, request.partitionId, request.targetId),
      )
    ).payload;
  }

  @LogError
  async getHoldCountForByPartition(request: GetHoldCountForByPartitionRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetHoldCountForByPartitionRequest", request);

    return (
      await this.queryBus.execute(
        new GetHoldCountForByPartitionQuery(request.securityId, request.partitionId, request.targetId),
      )
    ).payload;
  }

  @LogError
  async getHoldsIdForByPartition(request: GetHoldsIdForByPartitionRequest): Promise<number[]> {
    ValidatedRequest.handleValidation("GetHoldsIdForByPartitionRequest", request);

    return (
      await this.queryBus.execute(
        new GetHoldsIdForByPartitionQuery(
          request.securityId,
          request.partitionId,
          request.targetId,
          request.start,
          request.end,
        ),
      )
    ).payload;
  }

  @LogError
  async getHoldForByPartition(request: GetHoldForByPartitionRequest): Promise<HoldViewModel> {
    ValidatedRequest.handleValidation("GetHoldForByPartitionRequest", request);

    const res = (
      await this.queryBus.execute(
        new GetHoldForByPartitionQuery(request.securityId, request.partitionId, request.targetId, request.holdId),
      )
    ).payload;

    const hold: HoldViewModel = {
      id: request.holdId,
      amount: res.amount.toString(),
      expirationDate: new Date(res.expirationTimeStamp * ONE_THOUSAND),
      tokenHolderAddress: res.tokenHolderAddress,
      escrowAddress: res.escrowAddress,
      destinationAddress: res.destinationAddress,
      data: res.data,
      operatorData: res.operatorData,
    };

    return hold;
  }

  @LogError
  async releaseHoldByPartition(
    request: ReleaseHoldByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, partitionId, amount, targetId, holdId } = request;
    ValidatedRequest.handleValidation("ReleaseHoldByPartitionRequest", request);

    return await this.commandBus.execute(
      new ReleaseHoldByPartitionCommand(securityId, partitionId, amount, holdId, targetId),
    );
  }

  @LogError
  async reclaimHoldByPartition(
    request: ReclaimHoldByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, partitionId, targetId, holdId } = request;
    ValidatedRequest.handleValidation("ReclaimHoldByPartitionRequest", request);

    return await this.commandBus.execute(new ReclaimHoldByPartitionCommand(securityId, partitionId, holdId, targetId));
  }

  @LogError
  async executeHoldByPartition(
    request: ExecuteHoldByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, sourceId, amount, holdId, targetId, partitionId } = request;
    ValidatedRequest.handleValidation("ExecuteHoldByPartitionRequest", request);

    return await this.commandBus.execute(
      new ExecuteHoldByPartitionCommand(securityId, sourceId, amount, holdId, targetId, partitionId),
    );
  }
}
