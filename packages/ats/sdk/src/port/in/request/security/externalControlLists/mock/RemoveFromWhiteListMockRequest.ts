// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class RemoveFromWhiteListMockRequest extends ValidatedRequest<RemoveFromWhiteListMockRequest> {
  contractId: string;
  targetId: string;

  constructor({ contractId, targetId }: { contractId: string; targetId: string }) {
    super({
      contractId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.contractId = contractId;
    this.targetId = targetId;
  }
}
