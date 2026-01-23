// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import {
  GetTokenHoldersAtSnapshotRequest,
  GetTotalTokenHoldersAtSnapshotRequest,
  TakeSnapshotRequest,
} from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { BaseSecurityInPort } from "../BaseSecurityInPort";
import { TakeSnapshotCommand } from "@command/security/operations/snapshot/takeSnapshot/TakeSnapshotCommand";
import { GetTokenHoldersAtSnapshotQuery } from "@query/security/snapshot/getTokenHoldersAtSnapshot/GetTokenHoldersAtSnapshotQuery";
import { GetTotalTokenHoldersAtSnapshotQuery } from "@query/security/snapshot/getTotalTokenHoldersAtSnapshot/GetTotalTokenHoldersAtSnapshotQuery";

export interface ISecurityInPortSnapshot {
  takeSnapshot(request: TakeSnapshotRequest): Promise<{ payload: number; transactionId: string }>;
  getTokenHoldersAtSnapshot(request: GetTokenHoldersAtSnapshotRequest): Promise<string[]>;
  getTotalTokenHoldersAtSnapshot(request: GetTotalTokenHoldersAtSnapshotRequest): Promise<number>;
}

export class SecurityInPortSnapshot extends BaseSecurityInPort implements ISecurityInPortSnapshot {
  @LogError
  async takeSnapshot(request: TakeSnapshotRequest): Promise<{ payload: number; transactionId: string }> {
    const { securityId } = request;
    ValidatedRequest.handleValidation(TakeSnapshotRequest.name, request);

    return await this.commandBus.execute(new TakeSnapshotCommand(securityId));
  }

  @LogError
  async getTokenHoldersAtSnapshot(request: GetTokenHoldersAtSnapshotRequest): Promise<string[]> {
    const { securityId, snapshotId, start, end } = request;
    ValidatedRequest.handleValidation(GetTokenHoldersAtSnapshotRequest.name, request);

    return (await this.queryBus.execute(new GetTokenHoldersAtSnapshotQuery(securityId, snapshotId, start, end)))
      .payload;
  }

  @LogError
  async getTotalTokenHoldersAtSnapshot(request: GetTotalTokenHoldersAtSnapshotRequest): Promise<number> {
    const { securityId, snapshotId } = request;
    ValidatedRequest.handleValidation(GetTotalTokenHoldersAtSnapshotRequest.name, request);

    return (await this.queryBus.execute(new GetTotalTokenHoldersAtSnapshotQuery(securityId, snapshotId))).payload;
  }
}
