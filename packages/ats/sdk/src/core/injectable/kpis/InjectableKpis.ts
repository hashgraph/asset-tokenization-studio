// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { AddKpiDataCommandHandler } from "@command/kpis/addKpiData/AddKpiDataCommandHandler";

export const COMMAND_HANDLERS_KPI = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddKpiDataCommandHandler,
  },
];

export const QUERY_HANDLERS_KPI = [];
