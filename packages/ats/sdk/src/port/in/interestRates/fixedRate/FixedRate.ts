// SPDX-License-Identifier: Apache-2.0

import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { QueryBus } from "@core/query/QueryBus";
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import SetRateRequest from "../../request/interestRates/SetRateRequest";
import GetRateRequest from "../../request/interestRates/GetRateRequest";
import { SetRateCommand } from "@command/interestRates/setRate/SetRateCommand";
import { GetRateQuery } from "@query/interestRates/getRate/GetRateQuery";

interface IFixedRateInPort {
  setRate(request: SetRateRequest): Promise<{ payload: boolean; transactionId: string }>;
  getRate(request: GetRateRequest): Promise<{ rate: string; decimals: number }>;
}

class FixedRateInPort implements IFixedRateInPort {
  constructor(
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
  ) {}

  @LogError
  async setRate(request: SetRateRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("SetRateRequest", request);

    return await this.commandBus.execute(new SetRateCommand(request.securityId, request.rate, request.rateDecimals));
  }

  @LogError
  async getRate(request: GetRateRequest): Promise<{ rate: string; decimals: number }> {
    ValidatedRequest.handleValidation("GetRateRequest", request);

    return await this.queryBus.execute(new GetRateQuery(request.securityId));
  }
}

const FixedRate = new FixedRateInPort();
export default FixedRate;
