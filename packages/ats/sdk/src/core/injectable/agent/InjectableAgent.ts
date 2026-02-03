// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { RemoveAgentCommandHandler } from "@command/security/operations/agent/removeAgent/RemoveAgentCommandHandler";
import { AddAgentCommandHandler } from "@command/security/operations/agent/addAgent/AddAgentCommandHandler";

export const COMMAND_HANDLERS_AGENT = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddAgentCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveAgentCommandHandler,
  },
];
