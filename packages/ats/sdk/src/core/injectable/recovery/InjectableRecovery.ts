// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { RecoveryAddressCommandHandler } from "@command/security/operations/recoveryAddress/RecoveryAddressCommandHandler";
import { IsAddressRecoveredQueryHandler } from "@query/security/recovery/IsAddressRecoveredQueryHandler";

export const COMMAND_HANDLERS_RECOVERY = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RecoveryAddressCommandHandler,
  },
];

export const QUERY_HANDLERS_RECOVERY = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsAddressRecoveredQueryHandler,
  },
];
