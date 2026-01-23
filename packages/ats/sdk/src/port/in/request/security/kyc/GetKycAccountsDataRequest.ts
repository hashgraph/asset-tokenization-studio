// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GetKycAccountsDataRequest extends ValidatedRequest<GetKycAccountsDataRequest> {
  securityId: string;
  kycStatus: number;
  start: number;
  end: number;

  constructor({
    securityId,
    kycStatus,
    start,
    end,
  }: {
    securityId: string;
    kycStatus: number;
    start: number;
    end: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      kycStatus: FormatValidation.checkNumber({ min: 0 }),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.kycStatus = kycStatus;
    this.start = start;
    this.end = end;
  }
}
