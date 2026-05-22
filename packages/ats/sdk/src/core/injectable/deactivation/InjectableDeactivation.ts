// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { DeactivateCommandHandler } from "@command/security/operations/deactivate/DeactivateCommandHandler";
import { IsDeactivatedQueryHandler } from "@query/security/isDeactivated/IsDeactivatedQueryHandler";

export const COMMAND_HANDLERS_DEACTIVATION = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: DeactivateCommandHandler,
  },
];

export const QUERY_HANDLERS_DEACTIVATION = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsDeactivatedQueryHandler,
  },
];
