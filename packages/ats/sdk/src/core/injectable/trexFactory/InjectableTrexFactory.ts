// SPDX-License-Identifier: Apache-2.0

import { GetTokenBySaltQueryHandler } from "@query/factory/trex/getTokenBySalt/GetTokenBySaltQueryHandler";
import { TOKENS } from "../Tokens";
import { CreateTrexSuiteBondCommandHandler } from "@command/bond/createTrexSuite/CreateTrexSuiteBondCommandHandler";
import { CreateTrexSuiteEquityCommandHandler } from "@command/equity/createTrexSuite/CreateTrexSuiteEquityCommandHandler";

export const COMMAND_HANDLERS_TREX_FACTORY = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateTrexSuiteBondCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateTrexSuiteEquityCommandHandler,
  },
];

export const QUERY_HANDLERS_TREX_FACTORY = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTokenBySaltQueryHandler,
  },
];
