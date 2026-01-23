// SPDX-License-Identifier: Apache-2.0

import { SetIdentityRegistryCommandHandler } from "@command/security/identityRegistry/setIdentityRegistry/SetIdentityRegistryCommandHandler";
import { TOKENS } from "../Tokens";
import { SetOnchainIDCommandHandler } from "@command/security/operations/tokenMetadata/setOnchainID/SetOnchainIDCommandHandler";
import { OnchainIDQueryHandler } from "@query/security/tokenMetadata/onchainId/OnchainIDQueryHandler";
import { IdentityRegistryQueryHandler } from "@query/security/identityRegistry/IdentityRegistryQueryHandler";

export const COMMAND_HANDLERS_IDENTITY = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetIdentityRegistryCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetOnchainIDCommandHandler,
  },
];

export const QUERY_HANDLERS_IDENTITY = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: OnchainIDQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IdentityRegistryQueryHandler,
  },
];
