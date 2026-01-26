// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetTotalTokenHoldersAtSnapshotRequest extends ValidatedRequest<GetTotalTokenHoldersAtSnapshotRequest> {
  securityId: string;
  snapshotId: number;

  constructor({ securityId, snapshotId }: { securityId: string; snapshotId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      snapshotId: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.snapshotId = snapshotId;
  }
}
