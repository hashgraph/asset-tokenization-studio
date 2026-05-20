// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { SetMetadataCommand } from "@command/security/operations/metadata/setMetadata/SetMetadataCommand";
import { GetMetadataQuery } from "@query/security/getMetadata/GetMetadataQuery";
import { BaseSecurityInPort } from "../BaseSecurityInPort";
import SetMetadataRequest from "../../request/security/operations/metadata/SetMetadataRequest";
import GetMetadataRequest from "../../request/security/operations/metadata/GetMetadataRequest";

export interface ISecurityInPortMetadata {
  setMetadata(request: SetMetadataRequest): Promise<{ payload: boolean; transactionId: string }>;
  getMetadata(request: GetMetadataRequest): Promise<string[]>;
}

export class SecurityInPortMetadata extends BaseSecurityInPort implements ISecurityInPortMetadata {
  @LogError
  async setMetadata(request: SetMetadataRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, key, value } = request;
    ValidatedRequest.handleValidation("SetMetadataRequest", request);

    return await this.commandBus.execute(new SetMetadataCommand(securityId, key, value));
  }

  @LogError
  async getMetadata(request: GetMetadataRequest): Promise<string[]> {
    const { securityId, key } = request;
    ValidatedRequest.handleValidation("GetMetadataRequest", request);

    return (await this.queryBus.execute(new GetMetadataQuery(securityId, key))).value;
  }
}
