// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class SetRateRequest extends ValidatedRequest<SetRateRequest> {
  securityId: string;
  rate: string;
  rateDecimals: number;

  constructor({ securityId, rate, rateDecimals }: { securityId: string; rate: string; rateDecimals: number }) {
    super({});
    this.securityId = securityId;
    this.rate = rate;
    this.rateDecimals = rateDecimals;
  }
}
