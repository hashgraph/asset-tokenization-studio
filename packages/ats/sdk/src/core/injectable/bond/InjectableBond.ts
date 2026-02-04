// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { GetCouponForQueryHandler } from "@query/bond/coupons/getCouponFor/GetCouponForQueryHandler";
import { GetCouponAmountForQueryHandler } from "@query/bond/coupons/getCouponAmountFor/GetCouponAmountForQueryHandler";
import { GetPrincipalForQueryHandler } from "@query/bond/get/getPrincipalFor/GetPrincipalForQueryHandler";
import { GetCouponQueryHandler } from "@query/bond/coupons/getCoupon/GetCouponQueryHandler";
import { GetCouponCountQueryHandler } from "@query/bond/coupons/getCouponCount/GetCouponCountQueryHandler";
import { UpdateMaturityDateCommandHandler } from "@command/bond/updateMaturityDate/UpdateMaturityDateCommandHandler";
import { SetCouponCommandHandler } from "@command/bond/coupon/set/SetCouponCommandHandler";
import { CreateBondCommandHandler } from "@command/bond/create/CreateBondCommandHandler";
import { CreateBondFixedRateCommandHandler } from "@command/bond/createfixedrate/CreateBondFixedRateCommandHandler";
import { GetBondDetailsQueryHandler } from "@query/bond/get/getBondDetails/GetBondDetailsQueryHandler";
import { RedeemAtMaturityByPartitionCommandHandler } from "@command/bond/redeemAtMaturityByPartition/RedeemAtMaturityByPartitionCommandHandler";
import { GetTotalCouponHoldersQueryHandler } from "@query/bond/coupons/getTotalCouponHolders/GetTotalCouponHoldersQueryHandler";
import { GetCouponHoldersQueryHandler } from "@query/bond/coupons/getCouponHolders/GetCouponHoldersQueryHandler";
import { FullRedeemAtMaturityCommandHandler } from "@command/bond/fullRedeemAtMaturity/FullRedeemAtMaturityCommandHandler";
import { SetRateCommandHandler } from "@command/interestRates/setRate/SetRateCommandHandler";

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
];
