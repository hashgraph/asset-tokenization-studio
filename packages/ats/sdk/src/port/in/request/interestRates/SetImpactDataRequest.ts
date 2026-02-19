// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class SetImpactDataRequest extends ValidatedRequest<SetImpactDataRequest> {
  securityId: string;
  maxDeviationCap: string;
  baseLine: string;
  maxDeviationFloor: string;
  impactDataDecimals: number;
  adjustmentPrecision: string;

  constructor({
    securityId,
    maxDeviationCap,
    baseLine,
    maxDeviationFloor,
    impactDataDecimals,
    adjustmentPrecision,
  }: {
    securityId: string;
    maxDeviationCap: string;
    baseLine: string;
    maxDeviationFloor: string;
    impactDataDecimals: number;
    adjustmentPrecision: string;
  }) {
    super({});
    this.securityId = securityId;
    this.maxDeviationCap = maxDeviationCap;
    this.baseLine = baseLine;
    this.maxDeviationFloor = maxDeviationFloor;
    this.impactDataDecimals = impactDataDecimals;
    this.adjustmentPrecision = adjustmentPrecision;
  }
}
