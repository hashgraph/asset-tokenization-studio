// SPDX-License-Identifier: Apache-2.0

import { SetNameCommandHandler } from "@command/security/operations/tokenMetadata/setName/SetNameCommandHandler";
import { TOKENS } from "../Tokens";
import { SetSymbolCommandHandler } from "@command/security/operations/tokenMetadata/setSymbol/SetSymbolCommandHandler";

export const COMMAND_HANDLERS_METADATA = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetNameCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetSymbolCommandHandler,
  },
];
