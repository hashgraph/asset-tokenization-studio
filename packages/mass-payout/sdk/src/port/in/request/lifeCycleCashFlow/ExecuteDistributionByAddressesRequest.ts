// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

// eslint-disable-next-line max-len
export default class ExecuteDistributionByAddressesRequest extends ValidatedRequest<ExecuteDistributionByAddressesRequest> {
  lifeCycleCashFlow: string;
  asset: string;
  holders: string[];
  distributionId: string;

  constructor({
    lifeCycleCashFlow,
    asset,
    holders,
    distributionId,
  }: {
    lifeCycleCashFlow: string;
    asset: string;
    holders: string[];
    distributionId: string;
  }) {
    super({
      lifeCycleCashFlow: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      asset: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      holders: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "holders", false),
      distributionId: FormatValidation.checkNumber(),
    });

    this.lifeCycleCashFlow = lifeCycleCashFlow;
    this.asset = asset;
    this.holders = holders;
    this.distributionId = distributionId;
  }
}
