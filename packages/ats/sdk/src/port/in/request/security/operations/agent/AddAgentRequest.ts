// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class AddAgentRequest extends ValidatedRequest<AddAgentRequest> {
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
