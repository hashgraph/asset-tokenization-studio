// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class BalancesOfAtSnapshotRequest extends ValidatedRequest<BalancesOfAtSnapshotRequest> {
  securityId: string;
  snapshotId: number;
  pageIndex: number;
  pageLength: number;

  constructor({
    securityId,
    snapshotId,
    pageIndex,
    pageLength,
  }: {
    securityId: string;
    snapshotId: number;
    pageIndex: number;
    pageLength: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      snapshotId: FormatValidation.checkNumber({ min: 0 }),
      pageIndex: FormatValidation.checkNumber({ min: 0 }),
      pageLength: FormatValidation.checkNumber({ min: 1 }),
    });

    this.securityId = securityId;
    this.snapshotId = snapshotId;
    this.pageIndex = pageIndex;
    this.pageLength = pageLength;
  }
}
