// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../../FormatValidation";

export default class RemoveAgentRequest extends ValidatedRequest<RemoveAgentRequest> {
  securityId: string;
  agentId: string;

  constructor({ securityId, agentId }: { securityId: string; agentId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      agentId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.agentId = agentId;
  }
}
