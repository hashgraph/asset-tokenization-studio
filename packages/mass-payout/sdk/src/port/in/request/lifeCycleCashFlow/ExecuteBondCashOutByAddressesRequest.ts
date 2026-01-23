// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

// eslint-disable-next-line max-len
export default class ExecuteBondCashOutByAddressesRequest extends ValidatedRequest<ExecuteBondCashOutByAddressesRequest> {
  lifeCycleCashFlow: string;
  bond: string;
  holders: string[];

  constructor({ lifeCycleCashFlow, bond, holders }: { lifeCycleCashFlow: string; bond: string; holders: string[] }) {
    super({
      lifeCycleCashFlow: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      bond: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      holders: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "holders", false),
    });

    this.lifeCycleCashFlow = lifeCycleCashFlow;
    this.bond = bond;
    this.holders = holders;
  }
}
