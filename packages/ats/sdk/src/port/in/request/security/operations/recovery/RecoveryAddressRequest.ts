// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../../FormatValidation";

export default class RecoveryAddressRequest extends ValidatedRequest<RecoveryAddressRequest> {
  securityId: string;
  lostWalletId: string;
  newWalletId: string;

  constructor({
    securityId,
    lostWalletId,
    newWalletId,
  }: {
    lostWalletId: string;
    newWalletId: string;
    securityId: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      lostWalletId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      newWalletId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.lostWalletId = lostWalletId;
    this.newWalletId = newWalletId;
  }
}
