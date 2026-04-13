// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { SetAmortizationCommandHandler } from "@command/amortization/set/SetAmortizationCommandHandler";
import { CancelAmortizationCommandHandler } from "@command/amortization/cancel/CancelAmortizationCommandHandler";
import { SetAmortizationHoldCommandHandler } from "@command/amortization/setHold/SetAmortizationHoldCommandHandler";
import { ReleaseAmortizationHoldCommandHandler } from "@command/amortization/releaseHold/ReleaseAmortizationHoldCommandHandler";
import { GetAmortizationQueryHandler } from "@query/amortization/getAmortization/GetAmortizationQueryHandler";
import { GetAmortizationForQueryHandler } from "@query/amortization/getAmortizationFor/GetAmortizationForQueryHandler";
import { GetAmortizationsForQueryHandler } from "@query/amortization/getAmortizationsFor/GetAmortizationsForQueryHandler";
import { GetAmortizationsCountQueryHandler } from "@query/amortization/getAmortizationsCount/GetAmortizationsCountQueryHandler";
import { GetAmortizationHoldersQueryHandler } from "@query/amortization/getAmortizationHolders/GetAmortizationHoldersQueryHandler";
import { GetTotalAmortizationHoldersQueryHandler } from "@query/amortization/getTotalAmortizationHolders/GetTotalAmortizationHoldersQueryHandler";
import { GetAmortizationPaymentAmountQueryHandler } from "@query/amortization/getAmortizationPaymentAmount/GetAmortizationPaymentAmountQueryHandler";
import { GetActiveAmortizationHoldHoldersQueryHandler } from "@query/amortization/getActiveAmortizationHoldHolders/GetActiveAmortizationHoldHoldersQueryHandler";
import { GetTotalActiveAmortizationHoldHoldersQueryHandler } from "@query/amortization/getTotalActiveAmortizationHoldHolders/GetTotalActiveAmortizationHoldHoldersQueryHandler";
import { GetActiveAmortizationIdsQueryHandler } from "@query/amortization/getActiveAmortizationIds/GetActiveAmortizationIdsQueryHandler";
import { GetTotalActiveAmortizationIdsQueryHandler } from "@query/amortization/getTotalActiveAmortizationIds/GetTotalActiveAmortizationIdsQueryHandler";

export const COMMAND_HANDLERS_AMORTIZATION = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetAmortizationCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CancelAmortizationCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetAmortizationHoldCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ReleaseAmortizationHoldCommandHandler,
  },
];

export const QUERY_HANDLERS_AMORTIZATION = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAmortizationQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAmortizationForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAmortizationsForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAmortizationsCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAmortizationHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalAmortizationHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAmortizationPaymentAmountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetActiveAmortizationHoldHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalActiveAmortizationHoldHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetActiveAmortizationIdsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalActiveAmortizationIdsQueryHandler,
  },
];
