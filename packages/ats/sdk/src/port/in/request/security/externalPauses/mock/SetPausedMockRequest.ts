// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class SetPausedMockRequest extends ValidatedRequest<SetPausedMockRequest> {
  contractId: string;
  paused: boolean;

  constructor({ contractId, paused }: { contractId: string; paused: boolean }) {
    super({
      contractId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.contractId = contractId;
    this.paused = paused;
  }
}
