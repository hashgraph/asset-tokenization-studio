// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GetKycAccountsCountRequest extends ValidatedRequest<GetKycAccountsCountRequest> {
  securityId: string;
  kycStatus: number;

  constructor({ securityId, kycStatus }: { securityId: string; kycStatus: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      kycStatus: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.kycStatus = kycStatus;
  }
}
