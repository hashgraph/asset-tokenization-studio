// SPDX-License-Identifier: Apache-2.0

import { SetNameCommandHandler } from "@command/security/operations/tokenMetadata/setName/SetNameCommandHandler";
import { TOKENS } from "../Tokens";
import { SetSymbolCommandHandler } from "@command/security/operations/tokenMetadata/setSymbol/SetSymbolCommandHandler";
import { SetMetadataCommandHandler } from "@command/security/operations/metadata/setMetadata/SetMetadataCommandHandler";
import { GetMetadataQueryHandler } from "@query/security/getMetadata/GetMetadataQueryHandler";

export const COMMAND_HANDLERS_METADATA = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetNameCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetSymbolCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetMetadataCommandHandler,
  },
];

export const QUERY_HANDLERS_METADATA = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetMetadataQueryHandler,
  },
];
