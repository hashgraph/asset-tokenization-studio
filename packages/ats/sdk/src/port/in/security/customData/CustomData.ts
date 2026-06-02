// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { SetCustomDataCommand } from "@command/security/operations/customData/setCustomData/SetCustomDataCommand";
import { GetCustomDataQuery } from "@query/security/getCustomData/GetCustomDataQuery";
import { BaseSecurityInPort } from "../BaseSecurityInPort";
import SetCustomDataRequest from "../../request/security/operations/customData/SetCustomDataRequest";
import GetCustomDataRequest from "../../request/security/operations/customData/GetCustomDataRequest";

export interface ISecurityInPortCustomData {
  setCustomData(request: SetCustomDataRequest): Promise<{ payload: boolean; transactionId: string }>;
  getCustomData(request: GetCustomDataRequest): Promise<string[]>;
}

export class SecurityInPortCustomData extends BaseSecurityInPort implements ISecurityInPortCustomData {
  @LogError
  async setCustomData(request: SetCustomDataRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, key, value } = request;
    ValidatedRequest.handleValidation("SetCustomDataRequest", request);

    return await this.commandBus.execute(new SetCustomDataCommand(securityId, key, value));
  }

  @LogError
  async getCustomData(request: GetCustomDataRequest): Promise<string[]> {
    const { securityId, key } = request;
    ValidatedRequest.handleValidation("GetCustomDataRequest", request);

    return (await this.queryBus.execute(new GetCustomDataQuery(securityId, key))).value;
  }
}
