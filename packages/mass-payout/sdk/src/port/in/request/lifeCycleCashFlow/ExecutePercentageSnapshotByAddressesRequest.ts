// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

// eslint-disable-next-line max-len
export default class ExecutePercentageSnapshotByAddressesRequest extends ValidatedRequest<ExecutePercentageSnapshotByAddressesRequest> {
  lifeCycleCashFlow: string;
  asset: string;
  snapshotId: string;
  holders: string[];
  percentage: string;

  constructor({
    lifeCycleCashFlow,
    asset,
    snapshotId,
    holders,
    percentage,
  }: {
    lifeCycleCashFlow: string;
    asset: string;
    snapshotId: string;
    holders: string[];
    percentage: string;
  }) {
    super({
      lifeCycleCashFlow: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      asset: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      snapshotId: FormatValidation.checkNumber(),
      holders: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "holders", false),
      percentage: FormatValidation.checkAmount(),
    });

    this.lifeCycleCashFlow = lifeCycleCashFlow;
    this.asset = asset;
    this.snapshotId = snapshotId;
    this.holders = holders;
    this.percentage = percentage;
  }
}
