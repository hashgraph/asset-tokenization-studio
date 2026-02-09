// SPDX-License-Identifier: Apache-2.0

import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import GetInterestRateRequest from "@port/in/request/interestRates/GetInterestRateRequest";
import InterestRateViewModel from "@port/in/response/interestRates/InterestRateViewModel";
import {
  GetInterestRateQuery,
  GetInterestRateQueryResponse,
} from "../../../../app/usecase/query/interestRates/getInterestRate/GetInterestRateQuery";

interface IKpiLinkedRateInPort {
  getInterestRate(request: GetInterestRateRequest): Promise<InterestRateViewModel>;
}

class KpiLinkedRateInPort implements IKpiLinkedRateInPort {
  constructor(private readonly queryBus: QueryBus = Injectable.resolve(QueryBus)) {}

  @LogError
  async getInterestRate(request: GetInterestRateRequest): Promise<InterestRateViewModel> {
    ValidatedRequest.handleValidation("GetInterestRateRequest", request);

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

const KpiLinkedRate = new KpiLinkedRateInPort();
export default KpiLinkedRate;
