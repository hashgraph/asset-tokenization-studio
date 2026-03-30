// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { SetDividendCommandHandler } from "@command/dividend/set/SetDividendCommandHandler";
import { CancelDividendCommandHandler } from "@command/dividend/cancel/CancelDividendCommandHandler";
import { GetDividendForQueryHandler } from "@query/dividend/getDividendFor/GetDividendForQueryHandler";
import { GetDividendAmountForQueryHandler } from "@query/dividend/getDividendAmountFor/GetDividendAmountForQueryHandler";
import { GetDividendQueryHandler } from "@query/dividend/getDividend/GetDividendQueryHandler";
import { GetDividendsCountQueryHandler } from "@query/dividend/getDividendsCount/GetDividendsCountQueryHandler";
import { GetDividendHoldersQueryHandler } from "@query/dividend/getDividendHolders/GetDividendHoldersQueryHandler";
import { GetTotalDividendHoldersQueryHandler } from "@query/dividend/getTotalDividendHolders/GetTotalDividendHoldersQueryHandler";

export const COMMAND_HANDLERS_DIVIDEND = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetDividendCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CancelDividendCommandHandler,
  },
];

export const QUERY_HANDLERS_DIVIDEND = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendAmountForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendsCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalDividendHoldersQueryHandler,
  },
];
