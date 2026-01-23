// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ProtectedRedeemFromByPartitionRequest extends ValidatedRequest<ProtectedRedeemFromByPartitionRequest> {
  securityId: string;
  partitionId: string;
  sourceId: string;
  amount: string;
  deadline: string;
  nounce: number;
  signature: string;

  constructor({
    securityId,
    partitionId,
    sourceId,
    amount,
    deadline,
    nounce,
    signature,
  }: {
    securityId: string;
    partitionId: string;
    sourceId: string;
    amount: string;
    deadline: string;
    nounce: number;
    signature: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
      deadline: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000), undefined);
      },
    });

    this.securityId = securityId;
    this.sourceId = sourceId;
    this.amount = amount;
    this.partitionId = partitionId;
    this.deadline = deadline;
    this.nounce = nounce;
    this.signature = signature;
  }
}
