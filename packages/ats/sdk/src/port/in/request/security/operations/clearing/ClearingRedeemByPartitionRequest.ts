// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class ClearingRedeemByPartitionRequest extends ValidatedRequest<ClearingRedeemByPartitionRequest> {
  securityId: string;
  partitionId: string;
  amount: string;
  expirationDate: string;

  constructor({
    securityId,
    partitionId,
    amount,
    expirationDate,
  }: {
    securityId: string;
    partitionId: string;
    amount: string;
    expirationDate: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      amount: FormatValidation.checkAmount(),
      expirationDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000));
      },
    });

    this.securityId = securityId;
    this.partitionId = partitionId;
    this.amount = amount;
    this.expirationDate = expirationDate;
  }
}
