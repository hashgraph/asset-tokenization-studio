// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { UpdateConfigVersionCommandHandler } from "@command/management/updateConfigVersion/updateConfigVersionCommandHandler";
import { UpdateConfigCommandHandler } from "@command/management/updateConfig/updateConfigCommandHandler";
import { UpdateResolverCommandHandler } from "@command/management/updateResolver/updateResolverCommandHandler";
import { GetConfigInfoQueryHandler } from "@query/management/GetConfigInfoQueryHandler";

export const COMMAND_HANDLERS_RESOLVER = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UpdateConfigVersionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UpdateConfigCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UpdateResolverCommandHandler,
  },
];

export const QUERY_HANDLERS_RESOLVER = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetConfigInfoQueryHandler,
  },
];
