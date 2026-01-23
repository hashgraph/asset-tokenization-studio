// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetPaymentTokenDecimalsRequest extends ValidatedRequest<GetPaymentTokenDecimalsRequest> {
  lifeCycleCashFlow: string;

  constructor({ lifeCycleCashFlow }: { lifeCycleCashFlow: string }) {
    super({
      lifeCycleCashFlow: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.lifeCycleCashFlow = lifeCycleCashFlow;
  }
}
