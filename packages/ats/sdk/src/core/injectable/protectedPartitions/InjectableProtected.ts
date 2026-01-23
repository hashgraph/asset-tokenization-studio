// SPDX-License-Identifier: Apache-2.0

import { ProtectPartitionsCommandHandler } from "@command/security/operations/protectPartitions/ProtectPartitionsCommandHandler";
import { TOKENS } from "../Tokens";
import { UnprotectPartitionsCommandHandler } from "@command/security/operations/unprotectPartitions/UnprotectPartitionsCommandHandler";
import { PartitionsProtectedQueryHandler } from "@query/security/protectedPartitions/arePartitionsProtected/PartitionsProtectedQueryHandler";
import { GetNounceQueryHandler } from "@query/security/protectedPartitions/getNounce/GetNounceQueryHandler";

export const COMMAND_HANDLERS_PROTECTED = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ProtectPartitionsCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UnprotectPartitionsCommandHandler,
  },
];

export const QUERY_HANDLERS_PROTECTED = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: PartitionsProtectedQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetNounceQueryHandler,
  },
];
