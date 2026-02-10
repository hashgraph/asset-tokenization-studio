// SPDX-License-Identifier: Apache-2.0

import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import { CommandBus } from "@core/command/CommandBus";
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import GetInterestRateRequest from "@port/in/request/interestRates/GetInterestRateRequest";
import SetInterestRateRequest from "@port/in/request/interestRates/SetInterestRateRequest";
import InterestRateViewModel from "@port/in/response/interestRates/InterestRateViewModel";
import ImpactDataViewModel from "@port/in/response/interestRates/ImpactDataViewModel";
import GetImpactDataRequest from "@port/in/request/kpiLinkedRate/GetImpactDataRequest";
import {
  GetInterestRateQuery,
  GetInterestRateQueryResponse,
} from "../../../../app/usecase/query/interestRates/getInterestRate/GetInterestRateQuery";
import {
  GetImpactDataQuery,
  GetImpactDataQueryResponse,
} from "../../../../app/usecase/query/interestRates/getImpactData/GetImpactDataQuery";
import {
  SetInterestRateCommand,
  SetInterestRateCommandResponse,
} from "../../../../app/usecase/command/interestRates/setInterestRate/SetInterestRateCommand";

interface IKpiLinkedRateInPort {
  getInterestRate(request: GetInterestRateRequest): Promise<InterestRateViewModel>;
  getImpactData(request: GetImpactDataRequest): Promise<ImpactDataViewModel>;
  setInterestRate(request: SetInterestRateRequest): Promise<{ payload: boolean; transactionId: string }>;
}

class KpiLinkedRateInPort implements IKpiLinkedRateInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
  ) {}

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

  @LogError
  async getImpactData(request: GetImpactDataRequest): Promise<ImpactDataViewModel> {
    ValidatedRequest.handleValidation("GetImpactDataRequest", request);

    const query = new GetImpactDataQuery(request.securityId);

    const result: GetImpactDataQueryResponse = await this.queryBus.execute(query);

    return {
      maxDeviationCap: result.maxDeviationCap,
      baseLine: result.baseLine,
      maxDeviationFloor: result.maxDeviationFloor,
      impactDataDecimals: result.impactDataDecimals,
      adjustmentPrecision: result.adjustmentPrecision,
    };
  }

  @LogError
  async setInterestRate(request: SetInterestRateRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("SetInterestRateRequest", request);

    const command = new SetInterestRateCommand(
      request.securityId,
      request.maxRate,
      request.baseRate,
      request.minRate,
      request.startPeriod,
      request.startRate,
      request.missedPenalty,
      request.reportPeriod,
      request.rateDecimals,
    );

    const result: SetInterestRateCommandResponse = await this.commandBus.execute(command);

    return {
      payload: result.payload,
      transactionId: result.transactionId,
    };
  }
}

const KpiLinkedRate = new KpiLinkedRateInPort();
export default KpiLinkedRate;
