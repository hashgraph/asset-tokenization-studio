// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetTokenHoldersAtSnapshotRequest extends ValidatedRequest<GetTokenHoldersAtSnapshotRequest> {
  securityId: string;
  snapshotId: number;
  start: number;
  end: number;

  constructor({
    securityId,
    snapshotId,
    start,
    end,
  }: {
    securityId: string;
    snapshotId: number;
    start: number;
    end: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      snapshotId: FormatValidation.checkNumber({ min: 0 }),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.snapshotId = snapshotId;
    this.start = start;
    this.end = end;
  }
}
