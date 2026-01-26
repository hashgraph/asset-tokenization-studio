// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { BatchFreezePartialTokensCommandHandler } from "@command/security/operations/batch/batchFreezePartialTokens/BatchFreezePartialTokensCommandHandler";
import { BatchSetAddressFrozenCommandHandler } from "@command/security/operations/batch/batchSetAddressFrozen/BatchSetAddressFrozenCommandHandler";
import { BatchUnfreezePartialTokensCommandHandler } from "@command/security/operations/batch/batchUnfreezePartialTokens/BatchUnfreezePartialTokensCommandHandler";
import { SetAddressFrozenCommandHandler } from "@command/security/operations/freeze/setAddressFrozen/SetAddressFrozenCommandHandler";
import { FreezePartialTokensCommandHandler } from "@command/security/operations/freeze/freezePartialTokens/FreezePartialTokensCommandHandler";
import { UnfreezePartialTokensCommandHandler } from "@command/security/operations/freeze/unfreezePartialTokens/UnfreezePartialTokensCommandHandler";
import { GetFrozenPartialTokensQueryHandler } from "@query/security/freeze/getFrozenPartialTokens/GetFrozenPartialTokensQueryHandler";

export const COMMAND_HANDLERS_FREEZE = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: BatchFreezePartialTokensCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: BatchSetAddressFrozenCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: BatchUnfreezePartialTokensCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetAddressFrozenCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: FreezePartialTokensCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UnfreezePartialTokensCommandHandler,
  },
];

export const QUERY_HANDLERS_FREEZE = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetFrozenPartialTokensQueryHandler,
  },
];
