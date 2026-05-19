// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { SetMetadataCommand } from "@command/security/operations/metadata/setMetadata/SetMetadataCommand";
import { BaseSecurityInPort } from "../BaseSecurityInPort";
import SetMetadataRequest from "../../request/security/operations/metadata/SetMetadataRequest";

export interface ISecurityInPortMetadata {
  setMetadata(request: SetMetadataRequest): Promise<{ payload: boolean; transactionId: string }>;
}

export class SecurityInPortMetadata extends BaseSecurityInPort implements ISecurityInPortMetadata {
  @LogError
  async setMetadata(request: SetMetadataRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, key, value } = request;
    ValidatedRequest.handleValidation("SetMetadataRequest", request);

    return await this.commandBus.execute(new SetMetadataCommand(securityId, key, value));
  }
}
