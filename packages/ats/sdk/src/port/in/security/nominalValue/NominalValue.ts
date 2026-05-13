// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { SetNominalValueCommand } from "@command/security/nominalValue/setNominalValue/SetNominalValueCommand";
import { SetNominalValueCurrencyCommand } from "@command/security/nominalValue/setNominalValueCurrency/SetNominalValueCurrencyCommand";
import { GetNominalValueQuery } from "@query/security/nominalValue/getNominalValue/GetNominalValueQuery";
import { GetNominalValueDecimalsQuery } from "@query/security/nominalValue/getNominalValueDecimals/GetNominalValueDecimalsQuery";
import { GetNominalValueCurrencyQuery } from "@query/security/nominalValue/getNominalValueCurrency/GetNominalValueCurrencyQuery";
import { BaseSecurityInPort } from "../BaseSecurityInPort";
import SetNominalValueRequest from "../../request/security/operations/nominalValue/SetNominalValueRequest";
import SetNominalValueCurrencyRequest from "../../request/security/operations/nominalValue/SetNominalValueCurrencyRequest";
import GetNominalValueRequest from "../../request/security/operations/nominalValue/GetNominalValueRequest";
import GetNominalValueDecimalsRequest from "../../request/security/operations/nominalValue/GetNominalValueDecimalsRequest";
import GetNominalValueCurrencyRequest from "../../request/security/operations/nominalValue/GetNominalValueCurrencyRequest";

export interface ISecurityInPortNominalValue {
  setNominalValue(request: SetNominalValueRequest): Promise<{ payload: boolean; transactionId: string }>;
  setNominalValueCurrency(
    request: SetNominalValueCurrencyRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  getNominalValue(request: GetNominalValueRequest): Promise<string>;
  getNominalValueDecimals(request: GetNominalValueDecimalsRequest): Promise<number>;
  getNominalValueCurrency(request: GetNominalValueCurrencyRequest): Promise<string>;
}

export class SecurityInPortNominalValue extends BaseSecurityInPort implements ISecurityInPortNominalValue {
  @LogError
  async setNominalValue(request: SetNominalValueRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, nominalValue, nominalValueDecimals } = request;
    ValidatedRequest.handleValidation("SetNominalValueRequest", request);

    return await this.commandBus.execute(new SetNominalValueCommand(securityId, nominalValue, nominalValueDecimals));
  }

  @LogError
  async setNominalValueCurrency(
    request: SetNominalValueCurrencyRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, nominalValueCurrency } = request;
    ValidatedRequest.handleValidation("SetNominalValueCurrencyRequest", request);

    return await this.commandBus.execute(new SetNominalValueCurrencyCommand(securityId, nominalValueCurrency));
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

  @LogError
  async getNominalValueCurrency(request: GetNominalValueCurrencyRequest): Promise<string> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("GetNominalValueCurrencyRequest", request);

    return (await this.queryBus.execute(new GetNominalValueCurrencyQuery(securityId))).payload;
  }
}
