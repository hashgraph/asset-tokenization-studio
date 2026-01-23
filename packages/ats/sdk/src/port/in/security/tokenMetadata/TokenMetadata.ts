// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import { SetNameRequest, SetSymbolRequest } from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { SetNameCommand } from "@command/security/operations/tokenMetadata/setName/SetNameCommand";
import { SetSymbolCommand } from "@command/security/operations/tokenMetadata/setSymbol/SetSymbolCommand";
import { BaseSecurityInPort } from "../BaseSecurityInPort";

export interface ISecurityInPortTokenMetadata {
  setName(request: SetNameRequest): Promise<{ payload: boolean; transactionId: string }>;
  setSymbol(request: SetSymbolRequest): Promise<{ payload: boolean; transactionId: string }>;
}

export class SecurityInPortTokenMetadata extends BaseSecurityInPort implements ISecurityInPortTokenMetadata {
  @LogError
  async setName(request: SetNameRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, name } = request;
    ValidatedRequest.handleValidation("SetNameRequest", request);

    return await this.commandBus.execute(new SetNameCommand(securityId, name));
  }

  @LogError
  async setSymbol(request: SetSymbolRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, symbol } = request;
    ValidatedRequest.handleValidation("SetSymbolRequest", request);

    return await this.commandBus.execute(new SetSymbolCommand(securityId, symbol));
  }
}
