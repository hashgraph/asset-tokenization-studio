// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class TakeSnapshotRequest extends ValidatedRequest<TakeSnapshotRequest> {
  securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
  }
}
