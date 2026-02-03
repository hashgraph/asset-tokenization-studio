// SPDX-License-Identifier: Apache-2.0

import { GetTokenHoldersAtSnapshotQueryHandler } from "@query/security/snapshot/getTokenHoldersAtSnapshot/GetTokenHoldersAtSnapshotQueryHandler";
import { TOKENS } from "../Tokens";
import { TakeSnapshotCommandHandler } from "@command/security/operations/snapshot/takeSnapshot/TakeSnapshotCommandHandler";
import { GetTotalTokenHoldersAtSnapshotQueryHandler } from "@query/security/snapshot/getTotalTokenHoldersAtSnapshot/GetTotalTokenHoldersAtSnapshotQueryHandler";

export const COMMAND_HANDLERS_SNAPSHOT = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: TakeSnapshotCommandHandler,
  },
];

export const QUERY_HANDLERS_SNAPSHOT = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTokenHoldersAtSnapshotQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalTokenHoldersAtSnapshotQueryHandler,
  },
];
