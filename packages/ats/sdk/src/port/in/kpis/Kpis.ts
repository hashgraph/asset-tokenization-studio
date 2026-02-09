// SPDX-License-Identifier: Apache-2.0

import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { GetLatestKpiDataQuery } from "@query/interestRates/getLatestKpiData/GetLatestKpiDataQuery";
import GetLatestKpiDataRequest from "../request/kpis/GetLatestKpiDataRequest";
import { GetMinDateQuery } from "@query/kpis/getMinDate/GetMinDateQuery";
import GetMinDateRequest from "../request/kpis/GetMinDateRequest";

interface IKpisInPort {
  getLatestKpiData(request: GetLatestKpiDataRequest): Promise<{ value: string; exists: boolean }>;
  getMinDate(request: GetMinDateRequest): Promise<number>;
}

class KpisInPort implements IKpisInPort {
  constructor(private readonly queryBus: QueryBus = Injectable.resolve(QueryBus)) {}

  @LogError
  async getLatestKpiData(request: GetLatestKpiDataRequest): Promise<{ value: string; exists: boolean }> {
    ValidatedRequest.handleValidation("GetLatestKpiDataRequest", request);

    const response = await this.queryBus.execute(
      new GetLatestKpiDataQuery(request.securityId, request.from, request.to, request.kpi),
    );
    return { value: response.value, exists: response.exists };
  }

  @LogError
  async getMinDate(request: GetMinDateRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetMinDateRequest", request);

    const result = await this.queryBus.execute(new GetMinDateQuery(request.securityId));
    return result.minDate;
  }
}

const Kpis = new KpisInPort();
export default Kpis;
