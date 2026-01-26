// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import { GetNounceRequest, PartitionsProtectedRequest } from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { PartitionsProtectedQuery } from "@query/security/protectedPartitions/arePartitionsProtected/PartitionsProtectedQuery";
import { ProtectPartitionsCommand } from "@command/security/operations/protectPartitions/ProtectPartitionsCommand";
import { UnprotectPartitionsCommand } from "@command/security/operations/unprotectPartitions/UnprotectPartitionsCommand";
import { BaseSecurityInPort } from "../BaseSecurityInPort";
import { GetNounceQuery } from "@query/security/protectedPartitions/getNounce/GetNounceQuery";

export interface ISecurityInPortProtectedPartitions {
  arePartitionsProtected(request: PartitionsProtectedRequest): Promise<boolean>;
  protectPartitions(request: PartitionsProtectedRequest): Promise<{ payload: boolean; transactionId: string }>;
  unprotectPartitions(request: PartitionsProtectedRequest): Promise<{ payload: boolean; transactionId: string }>;
  getNounce(request: GetNounceRequest): Promise<number>;
}

export class SecurityInPortProtectedPartitions
  extends BaseSecurityInPort
  implements ISecurityInPortProtectedPartitions
{
  @LogError
  async arePartitionsProtected(request: PartitionsProtectedRequest): Promise<boolean> {
    ValidatedRequest.handleValidation("PartitionsProtectedRequest", request);

    return (await this.queryBus.execute(new PartitionsProtectedQuery(request.securityId))).payload;
  }

  @LogError
  async protectPartitions(request: PartitionsProtectedRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("PartitionsProtectedRequest", request);

    return await this.commandBus.execute(new ProtectPartitionsCommand(securityId));
  }

  @LogError
  async unprotectPartitions(request: PartitionsProtectedRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("PartitionsProtectedRequest", request);

    return await this.commandBus.execute(new UnprotectPartitionsCommand(securityId));
  }

  @LogError
  async getNounce(request: GetNounceRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetNounceRequest", request);

    return (await this.queryBus.execute(new GetNounceQuery(request.securityId, request.targetId))).payload;
  }
}
