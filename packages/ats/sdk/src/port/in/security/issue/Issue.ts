// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import { BatchMintRequest, IssueRequest, MintRequest } from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { IssueCommand } from "@command/security/operations/issue/IssueCommand";
import { MintCommand } from "@command/security/operations/mint/MintCommand";
import { BatchMintCommand } from "@command/security/operations/batch/batchMint/BatchMintCommand";
import { BaseSecurityInPort } from "../BaseSecurityInPort";

export interface ISecurityInPortIssue {
  issue(request: IssueRequest): Promise<{ payload: boolean; transactionId: string }>;
  batchMint(request: BatchMintRequest): Promise<{ payload: boolean; transactionId: string }>;
  mint(request: MintRequest): Promise<{ payload: boolean; transactionId: string }>;
}

export class SecurityInPortIssue extends BaseSecurityInPort implements ISecurityInPortIssue {
  @LogError
  async issue(request: IssueRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId } = request;
    ValidatedRequest.handleValidation("IssueRequest", request);

    return await this.commandBus.execute(new IssueCommand(amount, targetId, securityId));
  }

  @LogError
  async mint(request: MintRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId } = request;
    ValidatedRequest.handleValidation("MintRequest", request);

    return await this.commandBus.execute(new MintCommand(securityId, targetId, amount));
  }

  @LogError
  async batchMint(request: BatchMintRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("BatchMintRequest", request);
    return await this.commandBus.execute(new BatchMintCommand(request.securityId, request.amountList, request.toList));
  }
}
