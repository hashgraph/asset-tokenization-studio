// SPDX-License-Identifier: Apache-2.0

import { SetDividendCommand } from "@command/dividend/set/SetDividendCommand";
import { CancelDividendCommand } from "@command/dividend/cancel/CancelDividendCommand";
import { GetDividendQuery } from "@query/dividend/getDividend/GetDividendQuery";
import { GetDividendsCountQuery } from "@query/dividend/getDividendsCount/GetDividendsCountQuery";
import { GetDividendForQuery } from "@query/dividend/getDividendFor/GetDividendForQuery";
import { GetDividendAmountForQuery } from "@query/dividend/getDividendAmountFor/GetDividendAmountForQuery";
import { GetDividendHoldersQuery } from "@query/dividend/getDividendHolders/GetDividendHoldersQuery";
import { GetTotalDividendHoldersQuery } from "@query/dividend/getTotalDividendHolders/GetTotalDividendHoldersQuery";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { LogError } from "@core/decorator/LogErrorDecorator";
import { QueryBus } from "@core/query/QueryBus";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import SetDividendRequest from "../request/dividend/SetDividendRequest";
import CancelDividendRequest from "../request/dividend/CancelDividendRequest";
import GetDividendForRequest from "../request/dividend/GetDividendForRequest";
import GetDividendRequest from "../request/dividend/GetDividendRequest";
import GetAllDividendsRequest from "../request/dividend/GetAllDividendsRequest";
import GetDividendHoldersRequest from "../request/dividend/GetDividendHoldersRequest";
import GetTotalDividendHoldersRequest from "../request/dividend/GetTotalDividendHoldersRequest";
import DividendForViewModel from "../response/DividendForViewModel";
import DividendViewModel from "../response/DividendViewModel";
import DividendAmountForViewModel from "../response/DividendAmountForViewModel";

interface IDividendInPort {
  setDividend(request: SetDividendRequest): Promise<{ payload: number; transactionId: string }>;
  cancelDividend(request: CancelDividendRequest): Promise<{ payload: boolean; transactionId: string }>;
  getDividendFor(request: GetDividendForRequest): Promise<DividendForViewModel>;
  getDividendAmountFor(request: GetDividendForRequest): Promise<DividendAmountForViewModel>;
  getDividend(request: GetDividendRequest): Promise<DividendViewModel>;
  getAllDividends(request: GetAllDividendsRequest): Promise<DividendViewModel[]>;
  getDividendHolders(request: GetDividendHoldersRequest): Promise<string[]>;
  getTotalDividendHolders(request: GetTotalDividendHoldersRequest): Promise<number>;
}

class DividendInPort implements IDividendInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
  ) {}

  @LogError
  async setDividend(request: SetDividendRequest): Promise<{ payload: number; transactionId: string }> {
    const { amountPerUnitOfSecurity, recordTimestamp, executionTimestamp, securityId } = request;
    ValidatedRequest.handleValidation("SetDividendRequest", request);

    return await this.commandBus.execute(
      new SetDividendCommand(securityId, recordTimestamp, executionTimestamp, amountPerUnitOfSecurity),
    );
  }

  @LogError
  async cancelDividend(request: CancelDividendRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, dividendId } = request;
    ValidatedRequest.handleValidation("CancelDividendRequest", request);

    return await this.commandBus.execute(new CancelDividendCommand(securityId, dividendId));
  }

  @LogError
  async getDividendFor(request: GetDividendForRequest): Promise<DividendForViewModel> {
    ValidatedRequest.handleValidation("GetDividendForRequest", request);

    const res = await this.queryBus.execute(
      new GetDividendForQuery(request.targetId, request.securityId, request.dividendId),
    );

    const dividendsFor: DividendForViewModel = {
      tokenBalance: res.tokenBalance.toString(),
      decimals: res.decimals.toString(),
      isDisabled: res.isDisabled,
    };

    return dividendsFor;
  }

  @LogError
  async getDividendAmountFor(request: GetDividendForRequest): Promise<DividendAmountForViewModel> {
    ValidatedRequest.handleValidation("GetDividendForRequest", request);

    const res = await this.queryBus.execute(
      new GetDividendAmountForQuery(request.targetId, request.securityId, request.dividendId),
    );

    const dividendAmountFor: DividendAmountForViewModel = {
      numerator: res.numerator,
      denominator: res.denominator,
      recordDateReached: res.recordDateReached,
    };

    return dividendAmountFor;
  }

  @LogError
  async getDividend(request: GetDividendRequest): Promise<DividendViewModel> {
    ValidatedRequest.handleValidation("GetDividendRequest", request);

    const res = await this.queryBus.execute(new GetDividendQuery(request.securityId, request.dividendId));

    const dividend: DividendViewModel = {
      dividendId: request.dividendId,
      amountPerUnitOfSecurity: res.dividend.amountPerUnitOfSecurity.toString(),
      amountDecimals: res.dividend.amountDecimals,
      recordDate: new Date(res.dividend.recordTimeStamp * ONE_THOUSAND),
      executionDate: new Date(res.dividend.executionTimeStamp * ONE_THOUSAND),
      isDisabled: res.dividend.isDisabled,
    };

    return dividend;
  }

  @LogError
  async getAllDividends(request: GetAllDividendsRequest): Promise<DividendViewModel[]> {
    ValidatedRequest.handleValidation("GetAllDividendsRequest", request);

    const count = await this.queryBus.execute(new GetDividendsCountQuery(request.securityId));

    if (count.payload == 0) return [];

    const dividends: DividendViewModel[] = [];

    for (let i = 1; i <= count.payload; i++) {
      const res = await this.queryBus.execute(new GetDividendQuery(request.securityId, i));

      const dividend: DividendViewModel = {
        dividendId: i,
        amountPerUnitOfSecurity: res.dividend.amountPerUnitOfSecurity.toString(),
        amountDecimals: res.dividend.amountDecimals,
        recordDate: new Date(res.dividend.recordTimeStamp * ONE_THOUSAND),
        executionDate: new Date(res.dividend.executionTimeStamp * ONE_THOUSAND),
        isDisabled: res.dividend.isDisabled,
      };

      dividends.push(dividend);
    }

    return dividends;
  }

  @LogError
  async getDividendHolders(request: GetDividendHoldersRequest): Promise<string[]> {
    const { securityId, dividendId, start, end } = request;
    ValidatedRequest.handleValidation(GetDividendHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetDividendHoldersQuery(securityId, dividendId, start, end))).payload;
  }

  @LogError
  async getTotalDividendHolders(request: GetTotalDividendHoldersRequest): Promise<number> {
    const { securityId, dividendId } = request;
    ValidatedRequest.handleValidation(GetTotalDividendHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetTotalDividendHoldersQuery(securityId, dividendId))).payload;
  }
}

const DividendToken = new DividendInPort();
export default DividendToken;
export type { IDividendInPort };
