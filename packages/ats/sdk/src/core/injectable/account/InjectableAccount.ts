// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { GetAccountInfoQueryHandler } from "@query/account/info/GetAccountInfoQueryHandler";

export const QUERY_HANDLERS_ACCOUNT = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAccountInfoQueryHandler,
  },
];
