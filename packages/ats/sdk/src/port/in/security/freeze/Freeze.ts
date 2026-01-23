// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import {
  BatchFreezePartialTokensRequest,
  BatchSetAddressFrozenRequest,
  BatchUnfreezePartialTokensRequest,
  FreezePartialTokensRequest,
  GetFrozenPartialTokensRequest,
  SetAddressFrozenRequest,
  UnfreezePartialTokensRequest,
} from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { BatchSetAddressFrozenCommand } from "@command/security/operations/batch/batchSetAddressFrozen/BatchSetAddressFrozenCommand";
import { BatchFreezePartialTokensCommand } from "@command/security/operations/batch/batchFreezePartialTokens/BatchFreezePartialTokensCommand";
import { BatchUnfreezePartialTokensCommand } from "@command/security/operations/batch/batchUnfreezePartialTokens/BatchUnfreezePartialTokensCommand";
import { FreezePartialTokensCommand } from "@command/security/operations/freeze/freezePartialTokens/FreezePartialTokensCommand";
import { UnfreezePartialTokensCommand } from "@command/security/operations/freeze/unfreezePartialTokens/UnfreezePartialTokensCommand";
import { BalanceViewModel } from "../../response";
import { GetFrozenPartialTokensQuery } from "@query/security/freeze/getFrozenPartialTokens/GetFrozenPartialTokensQuery";
import { SetAddressFrozenCommand } from "@command/security/operations/freeze/setAddressFrozen/SetAddressFrozenCommand";
import { BaseSecurityInPort } from "../BaseSecurityInPort";

export interface ISecurityInPortFreeze {
  freezePartialTokens(request: FreezePartialTokensRequest): Promise<{ payload: boolean; transactionId: string }>;
  unfreezePartialTokens(request: UnfreezePartialTokensRequest): Promise<{ payload: boolean; transactionId: string }>;
  getFrozenPartialTokens(request: GetFrozenPartialTokensRequest): Promise<BalanceViewModel>;
  batchSetAddressFrozen(request: BatchSetAddressFrozenRequest): Promise<{ payload: boolean; transactionId: string }>;
  batchFreezePartialTokens(
    request: BatchFreezePartialTokensRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  batchUnfreezePartialTokens(
    request: BatchUnfreezePartialTokensRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  setAddressFrozen(request: SetAddressFrozenRequest): Promise<{ payload: boolean; transactionId: string }>;
}

export class SecurityInPortFreeze extends BaseSecurityInPort implements ISecurityInPortFreeze {
  @LogError
  async setAddressFrozen(request: SetAddressFrozenRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(SetAddressFrozenRequest.name, request);
    const { securityId, status, targetId } = request;
    return await this.commandBus.execute(new SetAddressFrozenCommand(securityId, status, targetId));
  }

  @LogError
  async batchSetAddressFrozen(
    request: BatchSetAddressFrozenRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("BatchSetAddressFrozenRequest", request);
    return await this.commandBus.execute(
      new BatchSetAddressFrozenCommand(request.securityId, request.freezeList, request.targetList),
    );
  }
  @LogError
  async batchFreezePartialTokens(
    request: BatchFreezePartialTokensRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("BatchFreezePartialTokensRequest", request);
    return await this.commandBus.execute(
      new BatchFreezePartialTokensCommand(request.securityId, request.amountList, request.targetList),
    );
  }
  @LogError
  async batchUnfreezePartialTokens(
    request: BatchUnfreezePartialTokensRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("BatchUnfreezePartialTokensRequest", request);
    return await this.commandBus.execute(
      new BatchUnfreezePartialTokensCommand(request.securityId, request.amountList, request.targetList),
    );
  }

  @LogError
  async freezePartialTokens(request: FreezePartialTokensRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("FreezePartialTokensRequest", request);
    const { securityId, amount, targetId } = request;
    return await this.commandBus.execute(new FreezePartialTokensCommand(securityId, amount, targetId));
  }

  @LogError
  async unfreezePartialTokens(
    request: UnfreezePartialTokensRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("UnfreezePartialTokensRequest", request);
    const { securityId, amount, targetId } = request;
    return await this.commandBus.execute(new UnfreezePartialTokensCommand(securityId, amount, targetId));
  }

  @LogError
  async getFrozenPartialTokens(request: GetFrozenPartialTokensRequest): Promise<BalanceViewModel> {
    ValidatedRequest.handleValidation("GetFrozenPartialTokensRequest", request);
    const res = await this.queryBus.execute(new GetFrozenPartialTokensQuery(request.securityId, request.targetId));

    const balance: BalanceViewModel = { value: res.payload.toString() };
    return balance;
  }
}
