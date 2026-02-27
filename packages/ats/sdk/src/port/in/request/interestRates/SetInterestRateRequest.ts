// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class SetInterestRateRequest extends ValidatedRequest<SetInterestRateRequest> {
  securityId: string;
  maxRate: string;
  baseRate: string;
  minRate: string;
  startPeriod: string;
  startRate: string;
  missedPenalty: string;
  reportPeriod: string;
  rateDecimals: number;

  constructor({
    securityId,
    maxRate,
    baseRate,
    minRate,
    startPeriod,
    startRate,
    missedPenalty,
    reportPeriod,
    rateDecimals,
  }: {
    securityId: string;
    maxRate: string;
    baseRate: string;
    minRate: string;
    startPeriod: string;
    startRate: string;
    missedPenalty: string;
    reportPeriod: string;
    rateDecimals: number;
  }) {
    super({});
    this.securityId = securityId;
    this.maxRate = maxRate;
    this.baseRate = baseRate;
    this.minRate = minRate;
    this.startPeriod = startPeriod;
    this.startRate = startRate;
    this.missedPenalty = missedPenalty;
    this.reportPeriod = reportPeriod;
    this.rateDecimals = rateDecimals;
  }
}
