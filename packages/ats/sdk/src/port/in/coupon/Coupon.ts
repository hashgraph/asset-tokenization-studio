// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { CommandBus } from "@core/command/CommandBus";
import { CastRateStatus } from "@domain/context/bond/RateStatus";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import { CancelCouponCommand } from "@command/bond/coupon/cancel/CancelCouponCommand";
import { SetCouponCommand } from "@command/bond/coupon/set/SetCouponCommand";
import { GetCouponQuery } from "@query/bond/coupons/getCoupon/GetCouponQuery";
import { GetCouponAmountForQuery } from "@query/bond/coupons/getCouponAmountFor/GetCouponAmountForQuery";
import { GetCouponCountQuery } from "@query/bond/coupons/getCouponCount/GetCouponCountQuery";
import { GetCouponForQuery } from "@query/bond/coupons/getCouponFor/GetCouponForQuery";
import { GetCouponsForQuery } from "@query/bond/coupons/getCouponsFor/GetCouponsForQuery";
import { GetCouponFromOrderedListAtQuery } from "@query/bond/coupons/getCouponFromOrderedListAt/GetCouponFromOrderedListAtQuery";
import { GetCouponHoldersQuery } from "@query/bond/coupons/getCouponHolders/GetCouponHoldersQuery";
import { GetCouponsOrderedListQuery } from "@query/bond/coupons/getCouponsOrderedList/GetCouponsOrderedListQuery";
import { GetCouponsOrderedListTotalQuery } from "@query/bond/coupons/getCouponsOrderedListTotal/GetCouponsOrderedListTotalQuery";
import { GetTotalCouponHoldersQuery } from "@query/bond/coupons/getTotalCouponHolders/GetTotalCouponHoldersQuery";
import { GetCouponHoldersRequest, GetTotalCouponHoldersRequest } from "../request";
import CancelCouponRequest from "../request/bond/CancelCouponRequest";
import GetAllCouponsRequest from "../request/bond/GetAllCouponsRequest";
import GetCouponForRequest from "../request/bond/GetCouponForRequest";
import GetCouponsForRequest from "../request/bond/GetCouponsForRequest";
import GetCouponFromOrderedListAtRequest from "../request/bond/GetCouponFromOrderedListAtRequest";
import GetCouponRequest from "../request/bond/GetCouponRequest";
import GetCouponsOrderedListRequest from "../request/bond/GetCouponsOrderedListRequest";
import GetCouponsOrderedListTotalRequest from "../request/bond/GetCouponsOrderedListTotalRequest";
import SetCouponRequest from "../request/bond/SetCouponRequest";
import CouponAmountForViewModel from "../response/CouponAmountForViewModel";
import CouponForViewModel from "../response/CouponForViewModel";
import CouponViewModel from "../response/CouponViewModel";

interface ICouponInPort {
  setCoupon(request: SetCouponRequest): Promise<{ payload: number; transactionId: string }>;
  cancelCoupon(request: CancelCouponRequest): Promise<{ payload: boolean; transactionId: string }>;
  getCouponFor(request: GetCouponForRequest): Promise<CouponForViewModel>;
  getCouponsFor(request: GetCouponsForRequest): Promise<{ coupons: CouponForViewModel[]; accounts: string[] }>;
  getCouponAmountFor(request: GetCouponForRequest): Promise<CouponAmountForViewModel>;
  getCoupon(request: GetCouponRequest): Promise<CouponViewModel>;
  getAllCoupons(request: GetAllCouponsRequest): Promise<CouponViewModel[]>;
  getCouponsOrderedList(request: GetCouponsOrderedListRequest): Promise<number[]>;
  getCouponsOrderedListTotal(request: GetCouponsOrderedListTotalRequest): Promise<number>;
  getCouponHolders(request: GetCouponHoldersRequest): Promise<string[]>;
  getTotalCouponHolders(request: GetTotalCouponHoldersRequest): Promise<number>;
  getCouponFromOrderedListAt(request: GetCouponFromOrderedListAtRequest): Promise<number>;
}

class CouponInPort implements ICouponInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
  ) {}

  @LogError
  async setCoupon(request: SetCouponRequest): Promise<{ payload: number; transactionId: string }> {
    const {
      rate,
      recordTimestamp,
      executionTimestamp,
      securityId,
      startTimestamp,
      endTimestamp,
      fixingTimestamp,
      rateStatus,
    } = request;
    ValidatedRequest.handleValidation("SetCouponRequest", request);

    return await this.commandBus.execute(
      new SetCouponCommand(
        securityId,
        recordTimestamp,
        executionTimestamp,
        rate,
        startTimestamp,
        endTimestamp,
        fixingTimestamp,
        CastRateStatus.fromNumber(rateStatus),
      ),
    );
  }

  @LogError
  async cancelCoupon(request: CancelCouponRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, couponId } = request;
    ValidatedRequest.handleValidation("CancelCouponRequest", request);

    return await this.commandBus.execute(new CancelCouponCommand(securityId, couponId));
  }

  @LogError
  async getCouponFor(request: GetCouponForRequest): Promise<CouponForViewModel> {
    ValidatedRequest.handleValidation("GetCouponForRequest", request);

    const res = await this.queryBus.execute(
      new GetCouponForQuery(request.targetId, request.securityId, request.couponId),
    );

    const couponFor: CouponForViewModel = {
      tokenBalance: res.tokenBalance.toString(),
      nominalValue: res.nominalValue.toString(),
      decimals: res.decimals.toString(),
      recordDateReached: res.recordDateReached,
      coupon: {
        recordDate: new Date(res.coupon.recordTimeStamp * ONE_THOUSAND),
        executionDate: new Date(res.coupon.executionTimeStamp * ONE_THOUSAND),
        rate: res.coupon.rate.toString(),
        rateDecimals: res.coupon.rateDecimals,
        startDate: new Date(res.coupon.startTimeStamp * ONE_THOUSAND),
        endDate: new Date(res.coupon.endTimeStamp * ONE_THOUSAND),
        fixingDate: new Date(res.coupon.fixingTimeStamp * ONE_THOUSAND),
        rateStatus: CastRateStatus.toNumber(res.coupon.rateStatus),
      },
      couponAmount: {
        numerator: res.couponAmount.numerator,
        denominator: res.couponAmount.denominator,
        recordDateReached: res.couponAmount.recordDateReached,
      },
      isDisabled: res.isDisabled,
    };

    return couponFor;
  }

  @LogError
  async getCouponsFor(request: GetCouponsForRequest): Promise<{ coupons: CouponForViewModel[]; accounts: string[] }> {
    ValidatedRequest.handleValidation("GetCouponsForRequest", request);

    const res = await this.queryBus.execute(
      new GetCouponsForQuery(request.securityId, request.couponId, request.pageIndex, request.pageLength),
    );

    const coupons: CouponForViewModel[] = res.coupons.map((couponFor) => ({
      tokenBalance: couponFor.tokenBalance.toString(),
      nominalValue: couponFor.nominalValue.toString(),
      decimals: couponFor.decimals.toString(),
      recordDateReached: couponFor.recordDateReached,
      coupon: {
        recordDate: new Date(couponFor.coupon.recordTimeStamp * ONE_THOUSAND),
        executionDate: new Date(couponFor.coupon.executionTimeStamp * ONE_THOUSAND),
        rate: couponFor.coupon.rate.toString(),
        rateDecimals: couponFor.coupon.rateDecimals,
        startDate: new Date(couponFor.coupon.startTimeStamp * ONE_THOUSAND),
        endDate: new Date(couponFor.coupon.endTimeStamp * ONE_THOUSAND),
        fixingDate: new Date(couponFor.coupon.fixingTimeStamp * ONE_THOUSAND),
        rateStatus: CastRateStatus.toNumber(couponFor.coupon.rateStatus),
      },
      couponAmount: {
        numerator: couponFor.couponAmount.numerator,
        denominator: couponFor.couponAmount.denominator,
        recordDateReached: couponFor.couponAmount.recordDateReached,
      },
      isDisabled: couponFor.isDisabled,
    }));

    return { coupons, accounts: res.accounts };
  }

  @LogError
  async getCouponAmountFor(request: GetCouponForRequest): Promise<CouponAmountForViewModel> {
    ValidatedRequest.handleValidation("GetCouponForRequest", request);

    const res = await this.queryBus.execute(
      new GetCouponAmountForQuery(request.targetId, request.securityId, request.couponId),
    );

    const couponAmountFor: CouponAmountForViewModel = {
      numerator: res.numerator,
      denominator: res.denominator,
      recordDateReached: res.recordDateReached,
    };

    return couponAmountFor;
  }

  @LogError
  async getCoupon(request: GetCouponRequest): Promise<CouponViewModel> {
    ValidatedRequest.handleValidation("GetCouponRequest", request);

    const res = await this.queryBus.execute(new GetCouponQuery(request.securityId, request.couponId));

    const coupon: CouponViewModel = {
      couponId: request.couponId,
      recordDate: new Date(res.coupon.recordTimeStamp * ONE_THOUSAND),
      executionDate: new Date(res.coupon.executionTimeStamp * ONE_THOUSAND),
      rate: res.coupon.rate.toString(),
      rateDecimals: res.coupon.rateDecimals,
      startDate: new Date(res.coupon.startTimeStamp * ONE_THOUSAND),
      endDate: new Date(res.coupon.endTimeStamp * ONE_THOUSAND),
      fixingDate: new Date(res.coupon.fixingTimeStamp * ONE_THOUSAND),
      rateStatus: CastRateStatus.toNumber(res.coupon.rateStatus),
      isDisabled: res.coupon.isDisabled,
    };

    return coupon;
  }

  @LogError
  async getAllCoupons(request: GetAllCouponsRequest): Promise<CouponViewModel[]> {
    ValidatedRequest.handleValidation("GetAllCouponsRequest", request);

    const count = await this.queryBus.execute(new GetCouponCountQuery(request.securityId));

    if (count.payload == 0) return [];

    const coupons: CouponViewModel[] = [];

    for (let i = 1; i <= count.payload; i++) {
      const couponRequest = new GetCouponRequest({
        securityId: request.securityId,
        couponId: i,
      });

      const coupon = await this.getCoupon(couponRequest);

      coupons.push(coupon);
    }

    return coupons;
  }

  @LogError
  async getCouponsOrderedList(request: GetCouponsOrderedListRequest): Promise<number[]> {
    ValidatedRequest.handleValidation("GetCouponsOrderedListRequest", request);

    const { securityId, pageIndex, pageLength } = request;

    const result = await this.queryBus.execute(new GetCouponsOrderedListQuery(securityId, pageIndex, pageLength));

    return result.payload;
  }

  @LogError
  async getCouponsOrderedListTotal(request: GetCouponsOrderedListTotalRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetCouponsOrderedListTotalRequest", request);

    const { securityId } = request;

    const result = await this.queryBus.execute(new GetCouponsOrderedListTotalQuery(securityId));

    return result.payload;
  }

  @LogError
  async getCouponHolders(request: GetCouponHoldersRequest): Promise<string[]> {
    const { securityId, couponId, start, end } = request;
    ValidatedRequest.handleValidation(GetCouponHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetCouponHoldersQuery(securityId, couponId, start, end))).payload;
  }

  @LogError
  async getTotalCouponHolders(request: GetTotalCouponHoldersRequest): Promise<number> {
    const { securityId, couponId } = request;
    ValidatedRequest.handleValidation(GetTotalCouponHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetTotalCouponHoldersQuery(securityId, couponId))).payload;
  }

  @LogError
  async getCouponFromOrderedListAt(request: GetCouponFromOrderedListAtRequest): Promise<number> {
    const { securityId, pos } = request;
    ValidatedRequest.handleValidation(GetCouponFromOrderedListAtRequest.name, request);

    return (await this.queryBus.execute(new GetCouponFromOrderedListAtQuery(securityId, pos))).couponId;
  }
}

const CouponToken = new CouponInPort();
export default CouponToken;
