// SPDX-License-Identifier: Apache-2.0

import { BatchBurnCommandHandler } from "@command/security/operations/batch/batchBurn/BatchBurnCommandHandler";
import { TOKENS } from "../Tokens";
import { BurnCommandHandler } from "@command/security/operations/burn/BurnCommandHandler";
import { ProtectedRedeemFromByPartitionCommandHandler } from "@command/security/operations/redeem/ProtectedRedeemFromByPartitionCommandHandler";
import { RedeemCommandHandler } from "@command/security/operations/redeem/RedeemCommandHandler";
import { CanRedeemByPartitionQueryHandler } from "@query/security/canRedeemByPartition/CanRedeemByPartitionQueryHandler";

export const COMMAND_HANDLERS_REDEEM = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RedeemCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ProtectedRedeemFromByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: BurnCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: BatchBurnCommandHandler,
  },
];

export const QUERY_HANDLERS_REDEEM = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: CanRedeemByPartitionQueryHandler,
  },
];
