// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { SetNominalValueCommand } from "@command/security/nominalValue/setNominalValue/SetNominalValueCommand";
import { GetNominalValueQuery } from "@query/security/nominalValue/getNominalValue/GetNominalValueQuery";
import { GetNominalValueDecimalsQuery } from "@query/security/nominalValue/getNominalValueDecimals/GetNominalValueDecimalsQuery";
import { BaseSecurityInPort } from "../BaseSecurityInPort";
import SetNominalValueRequest from "../../request/security/operations/nominalValue/SetNominalValueRequest";
import GetNominalValueRequest from "../../request/security/operations/nominalValue/GetNominalValueRequest";
import GetNominalValueDecimalsRequest from "../../request/security/operations/nominalValue/GetNominalValueDecimalsRequest";

export interface ISecurityInPortNominalValue {
  setNominalValue(request: SetNominalValueRequest): Promise<{ payload: boolean; transactionId: string }>;
  getNominalValue(request: GetNominalValueRequest): Promise<string>;
  getNominalValueDecimals(request: GetNominalValueDecimalsRequest): Promise<number>;
}

export class SecurityInPortNominalValue extends BaseSecurityInPort implements ISecurityInPortNominalValue {
  @LogError
  async setNominalValue(request: SetNominalValueRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, nominalValue, nominalValueDecimals } = request;
    ValidatedRequest.handleValidation("SetNominalValueRequest", request);

    return await this.commandBus.execute(new SetNominalValueCommand(securityId, nominalValue, nominalValueDecimals));
  }

  @LogError
  async getNominalValue(request: GetNominalValueRequest): Promise<string> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("GetNominalValueRequest", request);

    return (await this.queryBus.execute(new GetNominalValueQuery(securityId))).payload.toString();
  }

  @LogError
  async getNominalValueDecimals(request: GetNominalValueDecimalsRequest): Promise<number> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("GetNominalValueDecimalsRequest", request);

    return (await this.queryBus.execute(new GetNominalValueDecimalsQuery(securityId))).payload;
  }
}
