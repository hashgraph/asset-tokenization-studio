// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { SetNominalValueCommandHandler } from "@command/security/nominalValue/setNominalValue/SetNominalValueCommandHandler";
import { SetNominalValueCurrencyCommandHandler } from "@command/security/nominalValue/setNominalValueCurrency/SetNominalValueCurrencyCommandHandler";
import { GetNominalValueQueryHandler } from "@query/security/nominalValue/getNominalValue/GetNominalValueQueryHandler";
import { GetNominalValueDecimalsQueryHandler } from "@query/security/nominalValue/getNominalValueDecimals/GetNominalValueDecimalsQueryHandler";
import { GetNominalValueCurrencyQueryHandler } from "@query/security/nominalValue/getNominalValueCurrency/GetNominalValueCurrencyQueryHandler";

export const COMMAND_HANDLERS_NOMINAL_VALUE = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetNominalValueCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetNominalValueCurrencyCommandHandler,
  },
];

export const QUERY_HANDLERS_NOMINAL_VALUE = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetNominalValueQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetNominalValueDecimalsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetNominalValueCurrencyQueryHandler,
  },
];
