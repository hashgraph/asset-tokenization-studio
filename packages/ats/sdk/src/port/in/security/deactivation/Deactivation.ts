// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import { DeactivateRequest } from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { DeactivateCommand } from "@command/security/operations/deactivate/DeactivateCommand";
import { IsDeactivatedQuery } from "@query/security/isDeactivated/IsDeactivatedQuery";
import { BaseSecurityInPort } from "../BaseSecurityInPort";

export interface ISecurityInPortDeactivation {
  deactivate(request: DeactivateRequest): Promise<{ payload: boolean; transactionId: string }>;
  isDeactivated(request: DeactivateRequest): Promise<boolean>;
}

export class SecurityInPortDeactivation extends BaseSecurityInPort implements ISecurityInPortDeactivation {
  @LogError
  async deactivate(request: DeactivateRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("DeactivateRequest", request);
    return this.commandBus.execute(new DeactivateCommand(request.securityId));
  }

  @LogError
  async isDeactivated(request: DeactivateRequest): Promise<boolean> {
    ValidatedRequest.handleValidation("DeactivateRequest", request);
    return (await this.queryBus.execute(new IsDeactivatedQuery(request.securityId))).payload;
  }
}
