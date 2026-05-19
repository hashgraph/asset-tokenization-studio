// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { DeactivateCommandHandler } from "@command/security/operations/deactivate/DeactivateCommandHandler";

export const COMMAND_HANDLERS_DEACTIVATION = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: DeactivateCommandHandler,
  },
];
