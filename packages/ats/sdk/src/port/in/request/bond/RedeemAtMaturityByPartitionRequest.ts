// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class RedeemAtMaturityByPartitionRequest extends ValidatedRequest<RedeemAtMaturityByPartitionRequest> {
  securityId: string;
  partitionId: string;
  sourceId: string;
  amount: string;

  constructor({
    securityId,
    partitionId,
    sourceId,
    amount,
  }: {
    securityId: string;
    partitionId: string;
    sourceId: string;
    amount: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
    });

    this.securityId = securityId;
    this.sourceId = sourceId;
    this.amount = amount;
    this.partitionId = partitionId;
  }
}
