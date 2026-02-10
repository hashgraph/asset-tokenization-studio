// SPDX-License-Identifier: Apache-2.0

import { SetCouponCommandHandler } from "@command/bond/coupon/set/SetCouponCommandHandler";
import { CreateBondCommandHandler } from "@command/bond/create/CreateBondCommandHandler";
import { CreateBondFixedRateCommandHandler } from "@command/bond/createfixedrate/CreateBondFixedRateCommandHandler";
import { CreateBondKpiLinkedRateCommandHandler } from "@command/bond/createkpilinkedrate/CreateBondKpiLinkedRateCommandHandler";
import { FullRedeemAtMaturityCommandHandler } from "@command/bond/fullRedeemAtMaturity/FullRedeemAtMaturityCommandHandler";
import { RedeemAtMaturityByPartitionCommandHandler } from "@command/bond/redeemAtMaturityByPartition/RedeemAtMaturityByPartitionCommandHandler";
import { UpdateMaturityDateCommandHandler } from "@command/bond/updateMaturityDate/UpdateMaturityDateCommandHandler";
import { SetRateCommandHandler } from "@command/interestRates/setRate/SetRateCommandHandler";
import { GetCouponQueryHandler } from "@query/bond/coupons/getCoupon/GetCouponQueryHandler";
import { GetCouponAmountForQueryHandler } from "@query/bond/coupons/getCouponAmountFor/GetCouponAmountForQueryHandler";
import { GetCouponCountQueryHandler } from "@query/bond/coupons/getCouponCount/GetCouponCountQueryHandler";
import { GetCouponForQueryHandler } from "@query/bond/coupons/getCouponFor/GetCouponForQueryHandler";
import { GetCouponHoldersQueryHandler } from "@query/bond/coupons/getCouponHolders/GetCouponHoldersQueryHandler";
import { GetTotalCouponHoldersQueryHandler } from "@query/bond/coupons/getTotalCouponHolders/GetTotalCouponHoldersQueryHandler";
import { GetCouponsOrderedListQueryHandler } from "@query/bond/coupons/getCouponsOrderedList/GetCouponsOrderedListQueryHandler";
import { GetCouponsOrderedListTotalQueryHandler } from "@query/bond/coupons/getCouponsOrderedListTotal/GetCouponsOrderedListTotalQueryHandler";
import { GetBondDetailsQueryHandler } from "@query/bond/get/getBondDetails/GetBondDetailsQueryHandler";
import { GetPrincipalForQueryHandler } from "@query/bond/get/getPrincipalFor/GetPrincipalForQueryHandler";
import { GetRateQueryHandler } from "@query/interestRates/getRate/GetRateQueryHandler";
import { GetInterestRateQueryHandler } from "@query/interestRates/getInterestRate/GetInterestRateQueryHandler";
import { GetImpactDataQueryHandler } from "@query/interestRates/getImpactData/GetImpactDataQueryHandler";
import { TOKENS } from "../Tokens";
import { GetLatestKpiDataQueryHandler } from "@query/interestRates/getLatestKpiData/GetLatestKpiDataQueryHandler";
import { GetCouponFromOrderedListAtQueryHandler } from "@query/bond/coupons/getCouponFromOrderedListAt/GetCouponFromOrderedListAtQueryHandler";
import { GetMinDateQueryHandler } from "@query/kpis/getMinDate/GetMinDateQueryHandler";
import { IsCheckPointDateQueryHandler } from "@query/kpis/isCheckPointDate/IsCheckPointDateQueryHandler";
import { ScheduledCouponListingCountQueryHandler } from "@query/scheduledTasks/scheduledCouponListingCount/ScheduledCouponListingCountQueryHandler";

export const COMMAND_HANDLERS_BOND = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateBondCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateBondFixedRateCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateBondKpiLinkedRateCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetCouponCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UpdateMaturityDateCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RedeemAtMaturityByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: FullRedeemAtMaturityCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetRateCommandHandler,
  },
];

export const QUERY_HANDLERS_BOND = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponAmountForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetPrincipalForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetBondDetailsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalCouponHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponFromOrderedListAtQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponsOrderedListQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponsOrderedListTotalQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRateQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetInterestRateQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetImpactDataQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetLatestKpiDataQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetMinDateQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsCheckPointDateQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: ScheduledCouponListingCountQueryHandler,
  },
];
