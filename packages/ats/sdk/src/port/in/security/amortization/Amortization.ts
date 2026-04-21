// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import { SetAmortizationCommand } from "@command/amortization/set/SetAmortizationCommand";
import { CancelAmortizationCommand } from "@command/amortization/cancel/CancelAmortizationCommand";
import { SetAmortizationHoldCommand } from "@command/amortization/setHold/SetAmortizationHoldCommand";
import { ReleaseAmortizationHoldCommand } from "@command/amortization/releaseHold/ReleaseAmortizationHoldCommand";
import { GetAmortizationQuery } from "@query/amortization/getAmortization/GetAmortizationQuery";
import { GetAmortizationForQuery } from "@query/amortization/getAmortizationFor/GetAmortizationForQuery";
import { GetAmortizationsForQuery } from "@query/amortization/getAmortizationsFor/GetAmortizationsForQuery";
import { GetAmortizationsCountQuery } from "@query/amortization/getAmortizationsCount/GetAmortizationsCountQuery";
import { GetAmortizationHoldersQuery } from "@query/amortization/getAmortizationHolders/GetAmortizationHoldersQuery";
import { GetTotalAmortizationHoldersQuery } from "@query/amortization/getTotalAmortizationHolders/GetTotalAmortizationHoldersQuery";
import { GetAmortizationPaymentAmountQuery } from "@query/amortization/getAmortizationPaymentAmount/GetAmortizationPaymentAmountQuery";
import { GetActiveAmortizationHoldHoldersQuery } from "@query/amortization/getActiveAmortizationHoldHolders/GetActiveAmortizationHoldHoldersQuery";
import { GetTotalActiveAmortizationHoldHoldersQuery } from "@query/amortization/getTotalActiveAmortizationHoldHolders/GetTotalActiveAmortizationHoldHoldersQuery";
import { GetActiveAmortizationIdsQuery } from "@query/amortization/getActiveAmortizationIds/GetActiveAmortizationIdsQuery";
import { GetTotalActiveAmortizationIdsQuery } from "@query/amortization/getTotalActiveAmortizationIds/GetTotalActiveAmortizationIdsQuery";
import SetAmortizationRequest from "../../request/security/amortization/SetAmortizationRequest";
import CancelAmortizationRequest from "../../request/security/amortization/CancelAmortizationRequest";
import SetAmortizationHoldRequest from "../../request/security/amortization/SetAmortizationHoldRequest";
import ReleaseAmortizationHoldRequest from "../../request/security/amortization/ReleaseAmortizationHoldRequest";
import GetAmortizationRequest from "../../request/security/amortization/GetAmortizationRequest";
import GetAmortizationForRequest from "../../request/security/amortization/GetAmortizationForRequest";
import GetAmortizationsForRequest from "../../request/security/amortization/GetAmortizationsForRequest";
import GetAmortizationsCountRequest from "../../request/security/amortization/GetAmortizationsCountRequest";
import GetAmortizationHoldersRequest from "../../request/security/amortization/GetAmortizationHoldersRequest";
import GetTotalAmortizationHoldersRequest from "../../request/security/amortization/GetTotalAmortizationHoldersRequest";
import GetAmortizationPaymentAmountRequest from "../../request/security/amortization/GetAmortizationPaymentAmountRequest";
import GetActiveAmortizationHoldHoldersRequest from "../../request/security/amortization/GetActiveAmortizationHoldHoldersRequest";
import GetTotalActiveAmortizationHoldHoldersRequest from "../../request/security/amortization/GetTotalActiveAmortizationHoldHoldersRequest";
import GetActiveAmortizationIdsRequest from "../../request/security/amortization/GetActiveAmortizationIdsRequest";
import GetTotalActiveAmortizationIdsRequest from "../../request/security/amortization/GetTotalActiveAmortizationIdsRequest";
import AmortizationViewModel from "../../response/AmortizationViewModel";
import AmortizationForViewModel from "../../response/AmortizationForViewModel";
import AmortizationPaymentAmountViewModel from "../../response/AmortizationPaymentAmountViewModel";
import { AmortizationFor } from "@domain/context/amortization/AmortizationFor";

interface IAmortizationInPort {
  setAmortization(request: SetAmortizationRequest): Promise<{ payload: number; transactionId: string }>;
  cancelAmortization(request: CancelAmortizationRequest): Promise<{ payload: boolean; transactionId: string }>;
  setAmortizationHold(request: SetAmortizationHoldRequest): Promise<{ payload: number; transactionId: string }>;
  releaseAmortizationHold(
    request: ReleaseAmortizationHoldRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  getAmortization(request: GetAmortizationRequest): Promise<AmortizationViewModel>;
  getAllAmortizations(request: GetAmortizationsCountRequest): Promise<AmortizationViewModel[]>;
  getAmortizationFor(request: GetAmortizationForRequest): Promise<AmortizationForViewModel>;
  getAmortizationsFor(request: GetAmortizationsForRequest): Promise<AmortizationForViewModel[]>;
  getAmortizationsCount(request: GetAmortizationsCountRequest): Promise<number>;
  getAmortizationHolders(request: GetAmortizationHoldersRequest): Promise<string[]>;
  getTotalAmortizationHolders(request: GetTotalAmortizationHoldersRequest): Promise<number>;
  getAmortizationPaymentAmount(
    request: GetAmortizationPaymentAmountRequest,
  ): Promise<AmortizationPaymentAmountViewModel>;
  getActiveAmortizationHoldHolders(request: GetActiveAmortizationHoldHoldersRequest): Promise<string[]>;
  getTotalActiveAmortizationHoldHolders(request: GetTotalActiveAmortizationHoldHoldersRequest): Promise<number>;
  getActiveAmortizationIds(request: GetActiveAmortizationIdsRequest): Promise<number[]>;
  getTotalActiveAmortizationIds(request: GetTotalActiveAmortizationIdsRequest): Promise<number>;
}

class AmortizationInPort implements IAmortizationInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
  ) {}

  @LogError
  async setAmortization(request: SetAmortizationRequest): Promise<{ payload: number; transactionId: string }> {
    const { securityId, recordTimestamp, executionTimestamp, tokensToRedeem } = request;
    ValidatedRequest.handleValidation("SetAmortizationRequest", request);

    return await this.commandBus.execute(
      new SetAmortizationCommand(securityId, recordTimestamp, executionTimestamp, tokensToRedeem),
    );
  }

  @LogError
  async cancelAmortization(request: CancelAmortizationRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amortizationId } = request;
    ValidatedRequest.handleValidation("CancelAmortizationRequest", request);

    return await this.commandBus.execute(new CancelAmortizationCommand(securityId, amortizationId));
  }

  @LogError
  async setAmortizationHold(request: SetAmortizationHoldRequest): Promise<{ payload: number; transactionId: string }> {
    const { securityId, amortizationId, tokenHolder, tokenAmount } = request;
    ValidatedRequest.handleValidation("SetAmortizationHoldRequest", request);

    return await this.commandBus.execute(
      new SetAmortizationHoldCommand(securityId, amortizationId, tokenHolder, tokenAmount),
    );
  }

  @LogError
  async releaseAmortizationHold(
    request: ReleaseAmortizationHoldRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amortizationId, tokenHolder } = request;
    ValidatedRequest.handleValidation("ReleaseAmortizationHoldRequest", request);

    return await this.commandBus.execute(new ReleaseAmortizationHoldCommand(securityId, amortizationId, tokenHolder));
  }

  @LogError
  async getAmortization(request: GetAmortizationRequest): Promise<AmortizationViewModel> {
    ValidatedRequest.handleValidation("GetAmortizationRequest", request);

    const res = await this.queryBus.execute(new GetAmortizationQuery(request.securityId, request.amortizationId));

    const amortization: AmortizationViewModel = {
      amortizationId: request.amortizationId,
      recordDate: new Date(res.amortization.amortization.recordDate * ONE_THOUSAND),
      executionDate: new Date(res.amortization.amortization.executionDate * ONE_THOUSAND),
      tokensToRedeem: res.amortization.amortization.tokensToRedeem.toString(),
      snapshotId: res.amortization.snapshotId,
      isDisabled: res.amortization.isDisabled,
    };

    return amortization;
  }

  @LogError
  async getAllAmortizations(request: GetAmortizationsCountRequest): Promise<AmortizationViewModel[]> {
    ValidatedRequest.handleValidation("GetAmortizationsCountRequest", request);

    const count = await this.queryBus.execute(new GetAmortizationsCountQuery(request.securityId));

    if (count.payload === 0) return [];

    const amortizations: AmortizationViewModel[] = [];

    for (let i = 1; i <= count.payload; i++) {
      const res = await this.queryBus.execute(new GetAmortizationQuery(request.securityId, i));

      const amortization: AmortizationViewModel = {
        amortizationId: i,
        recordDate: new Date(res.amortization.amortization.recordDate * ONE_THOUSAND),
        executionDate: new Date(res.amortization.amortization.executionDate * ONE_THOUSAND),
        tokensToRedeem: res.amortization.amortization.tokensToRedeem.toString(),
        snapshotId: res.amortization.snapshotId,
        isDisabled: res.amortization.isDisabled,
      };

      amortizations.push(amortization);
    }

    return amortizations;
  }

  @LogError
  async getAmortizationFor(request: GetAmortizationForRequest): Promise<AmortizationForViewModel> {
    ValidatedRequest.handleValidation("GetAmortizationForRequest", request);

    const res = await this.queryBus.execute(
      new GetAmortizationForQuery(request.securityId, request.targetId, request.amortizationId),
    );

    return _mapAmortizationFor(res.amortizationFor);
  }

  @LogError
  async getAmortizationsFor(request: GetAmortizationsForRequest): Promise<AmortizationForViewModel[]> {
    ValidatedRequest.handleValidation("GetAmortizationsForRequest", request);

    const res = await this.queryBus.execute(
      new GetAmortizationsForQuery(request.securityId, request.amortizationId, request.start, request.end),
    );

    return res.payload.map(_mapAmortizationFor);
  }

  @LogError
  async getAmortizationsCount(request: GetAmortizationsCountRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetAmortizationsCountRequest", request);

    return (await this.queryBus.execute(new GetAmortizationsCountQuery(request.securityId))).payload;
  }

  @LogError
  async getAmortizationHolders(request: GetAmortizationHoldersRequest): Promise<string[]> {
    const { securityId, amortizationId, start, end } = request;
    ValidatedRequest.handleValidation(GetAmortizationHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetAmortizationHoldersQuery(securityId, amortizationId, start, end)))
      .payload;
  }

  @LogError
  async getTotalAmortizationHolders(request: GetTotalAmortizationHoldersRequest): Promise<number> {
    const { securityId, amortizationId } = request;
    ValidatedRequest.handleValidation(GetTotalAmortizationHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetTotalAmortizationHoldersQuery(securityId, amortizationId))).payload;
  }

  @LogError
  async getAmortizationPaymentAmount(
    request: GetAmortizationPaymentAmountRequest,
  ): Promise<AmortizationPaymentAmountViewModel> {
    ValidatedRequest.handleValidation("GetAmortizationPaymentAmountRequest", request);

    const res = await this.queryBus.execute(
      new GetAmortizationPaymentAmountQuery(request.securityId, request.amortizationId, request.tokenHolder),
    );

    const paymentAmount: AmortizationPaymentAmountViewModel = {
      tokenAmount: res.amortizationPaymentAmount.tokenAmount.toString(),
      decimals: res.amortizationPaymentAmount.decimals,
    };

    return paymentAmount;
  }

  @LogError
  async getActiveAmortizationHoldHolders(request: GetActiveAmortizationHoldHoldersRequest): Promise<string[]> {
    const { securityId, amortizationId, start, end } = request;
    ValidatedRequest.handleValidation(GetActiveAmortizationHoldHoldersRequest.name, request);

    return (
      await this.queryBus.execute(new GetActiveAmortizationHoldHoldersQuery(securityId, amortizationId, start, end))
    ).payload;
  }

  @LogError
  async getTotalActiveAmortizationHoldHolders(request: GetTotalActiveAmortizationHoldHoldersRequest): Promise<number> {
    const { securityId, amortizationId } = request;
    ValidatedRequest.handleValidation(GetTotalActiveAmortizationHoldHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetTotalActiveAmortizationHoldHoldersQuery(securityId, amortizationId)))
      .payload;
  }

  @LogError
  async getActiveAmortizationIds(request: GetActiveAmortizationIdsRequest): Promise<number[]> {
    const { securityId, start, end } = request;
    ValidatedRequest.handleValidation(GetActiveAmortizationIdsRequest.name, request);

    return (await this.queryBus.execute(new GetActiveAmortizationIdsQuery(securityId, start, end))).payload;
  }

  @LogError
  async getTotalActiveAmortizationIds(request: GetTotalActiveAmortizationIdsRequest): Promise<number> {
    ValidatedRequest.handleValidation(GetTotalActiveAmortizationIdsRequest.name, request);

    return (await this.queryBus.execute(new GetTotalActiveAmortizationIdsQuery(request.securityId))).payload;
  }
}

function _mapAmortizationFor(af: AmortizationFor): AmortizationForViewModel {
  return {
    recordDate: new Date(af.recordDate * ONE_THOUSAND),
    executionDate: new Date(af.executionDate * ONE_THOUSAND),
    holdId: af.holdId,
    holdActive: af.holdActive,
    tokenHeldAmount: af.tokenHeldAmount.toString(),
    decimalsHeld: af.decimalsHeld,
    abafAtHold: af.abafAtHold.toString(),
    tokenBalance: af.tokenBalance.toString(),
    decimalsBalance: af.decimalsBalance,
    recordDateReached: af.recordDateReached,
    abafAtSnapshot: af.abafAtSnapshot.toString(),
    nominalValue: af.nominalValue.toString(),
    nominalValueDecimals: af.nominalValueDecimals,
  };
}

const AmortizationToken = new AmortizationInPort();
export default AmortizationToken;
export type { IAmortizationInPort };
