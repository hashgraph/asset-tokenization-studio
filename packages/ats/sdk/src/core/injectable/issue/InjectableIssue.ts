// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { MintCommandHandler } from "@command/security/operations/mint/MintCommandHandler";
import { IssueCommandHandler } from "@command/security/operations/issue/IssueCommandHandler";
import { BatchMintCommandHandler } from "@command/security/operations/batch/batchMint/BatchMintCommandHandler";

export const COMMAND_HANDLERS_ISSUE = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: MintCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: IssueCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: BatchMintCommandHandler,
  },
];
