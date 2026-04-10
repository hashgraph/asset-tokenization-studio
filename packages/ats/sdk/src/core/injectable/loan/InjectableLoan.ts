// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { CreateLoanCommandHandler } from "@command/loan/create/CreateLoanCommandHandler";
import { SetLoanDetailsCommandHandler } from "@command/loan/setDetails/SetLoanDetailsCommandHandler";
import { GetLoanDetailsQueryHandler } from "@query/loan/get/getLoanDetails/GetLoanDetailsQueryHandler";

export const COMMAND_HANDLERS_LOAN = [
  { token: TOKENS.COMMAND_HANDLER, useClass: CreateLoanCommandHandler },
  { token: TOKENS.COMMAND_HANDLER, useClass: SetLoanDetailsCommandHandler },
];

export const QUERY_HANDLERS_LOAN = [{ token: TOKENS.QUERY_HANDLER, useClass: GetLoanDetailsQueryHandler }];
