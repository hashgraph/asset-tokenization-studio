// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { GetAccountBalanceQueryHandler } from "@query/account/balance/GetAccountBalanceQueryHandler";
import { SetScheduledBalanceAdjustmentCommandHandler } from "@command/equity/balanceAdjustments/setScheduledBalanceAdjustment/SetScheduledBalanceAdjustmentCommandHandler";
import { BalanceOfQueryHandler } from "@query/security/balanceof/BalanceOfQueryHandler";
import { GetScheduledBalanceAdjustmentQueryHandler } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustment/GetScheduledBalanceAdjustmentQueryHandler";
import { GetScheduledBalanceAdjustmentCountQueryHandler } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustmentCount/GetScheduledBalanceAdjustmentsCountQueryHandler";

export const COMMAND_HANDLERS_BALANCE = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAccountBalanceQueryHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetScheduledBalanceAdjustmentCommandHandler,
  },
];

export const QUERY_HANDLERS_BALANCE = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: BalanceOfQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetScheduledBalanceAdjustmentQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetScheduledBalanceAdjustmentCountQueryHandler,
  },
];
