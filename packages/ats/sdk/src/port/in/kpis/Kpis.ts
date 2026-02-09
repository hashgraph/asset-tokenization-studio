// SPDX-License-Identifier: Apache-2.0

import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { GetLatestKpiDataQuery } from "@query/interestRates/getLatestKpiData/GetLatestKpiDataQuery";
import GetLatestKpiDataRequest from "../request/kpis/GetLatestKpiDataRequest";
import { GetMinDateQuery } from "@query/kpis/getMinDate/GetMinDateQuery";
import GetMinDateRequest from "../request/kpis/GetMinDateRequest";
import { IsCheckPointDateQuery } from "@query/kpis/isCheckPointDate/IsCheckPointDateQuery";
import IsCheckPointDateRequest from "../request/kpis/IsCheckPointDateRequest";

interface IKpisInPort {
  getLatestKpiData(request: GetLatestKpiDataRequest): Promise<{ value: string; exists: boolean }>;
  getMinDate(request: GetMinDateRequest): Promise<number>;
  isCheckPointDate(request: IsCheckPointDateRequest): Promise<boolean>;
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

  @LogError
  async isCheckPointDate(request: IsCheckPointDateRequest): Promise<boolean> {
    ValidatedRequest.handleValidation("IsCheckPointDateRequest", request);

    const result = await this.queryBus.execute(
      new IsCheckPointDateQuery(request.securityId, request.date, request.project),
    );
    return result.isCheckPoint;
  }
}

const Kpis = new KpisInPort();
export default Kpis;
