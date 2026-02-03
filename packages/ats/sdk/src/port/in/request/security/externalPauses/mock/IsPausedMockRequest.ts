// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class IsPausedMockRequest extends ValidatedRequest<IsPausedMockRequest> {
  contractId: string;

  constructor({ contractId }: { contractId: string }) {
    super({
      contractId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.contractId = contractId;
  }
}
