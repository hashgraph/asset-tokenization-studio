// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { LockCommandHandler } from "@command/security/operations/lock/LockCommandHandler";
import { ReleaseCommandHandler } from "@command/security/operations/release/ReleaseCommandHandler";
import { LockedBalanceOfQueryHandler } from "@query/security/lockedBalanceOf/LockedBalanceOfQueryHandler";
import { GetLockQueryHandler } from "@query/security/getLock/GetLockQueryHandler";
import { LocksIdQueryHandler } from "@query/security/locksId/LocksIdQueryHandler";
import { LockCountQueryHandler } from "@query/security/lockCount/LockCountQueryHandler";

export const COMMAND_HANDLERS_LOCK = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: LockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ReleaseCommandHandler,
  },
];

export const QUERY_HANDLERS_LOCK = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: LockedBalanceOfQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetLockQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: LocksIdQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: LockCountQueryHandler,
  },
];
