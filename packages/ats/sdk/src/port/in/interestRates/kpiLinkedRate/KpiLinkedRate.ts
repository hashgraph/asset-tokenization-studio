// SPDX-License-Identifier: Apache-2.0

import { QueryBus } from "@core/query/QueryBus";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { Validation } from "@core/validation/Validation";
import GetInterestRateRequest from "@port/in/request/interestRates/GetInterestRateRequest";
import InterestRateViewModel from "@port/in/response/interestRates/InterestRateViewModel";
import {
  GetInterestRateQuery,
  GetInterestRateQueryResponse,
} from "../../../../app/usecase/query/interestRates/getInterestRate/GetInterestRateQuery";

export class KpiLinkedRateInPort {
  constructor(
    @lazyInject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  async getInterestRate(request: GetInterestRateRequest): Promise<InterestRateViewModel> {
    Validation.handleValidation("GetInterestRateRequest", request);

    const query = new GetInterestRateQuery(request.securityId);

    const result: GetInterestRateQueryResponse = await this.queryBus.execute(query);

    return {
      maxRate: result.maxRate,
      baseRate: result.baseRate,
      minRate: result.minRate,
      startPeriod: result.startPeriod,
      startRate: result.startRate,
      missedPenalty: result.missedPenalty,
      reportPeriod: result.reportPeriod,
      rateDecimals: result.rateDecimals,
    };
  }
}
