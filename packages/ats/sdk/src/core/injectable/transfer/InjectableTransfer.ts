// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { TransferCommandHandler } from "@command/security/operations/transfer/TransferCommandHandler";
import { TransferAndLockCommandHandler } from "@command/security/operations/transfer/TransferAndLockCommandHandler";
import { ControllerRedeemCommandHandler } from "@command/security/operations/redeem/ControllerRedeemCommandHandler";
import { ControllerTransferCommandHandler } from "@command/security/operations/transfer/ControllerTransferCommandHandler";
import { ForcedTransferCommandHandler } from "@command/security/operations/transfer/ForcedTransferCommandHandler";
import { ProtectedTransferFromByPartitionCommandHandler } from "@command/security/operations/transfer/ProtectedTransferFromByPartitionCommandHandler";
import { BatchForcedTransferCommandHandler } from "@command/security/operations/batch/batchForcedTransfer/BatchForcedTransferCommandHandler";
import { BatchTransferCommandHandler } from "@command/security/operations/batch/batchTransfer/BatchTransferCommandHandler";
import { CanTransferByPartitionQueryHandler } from "@query/security/canTransferByPartition/CanTransferByPartitionQueryHandler";
import { CanTransferQueryHandler } from "@query/security/canTransfer/CanTransferQueryHandler";

export const COMMAND_HANDLERS_TRANSFER = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: TransferCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: TransferAndLockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ControllerRedeemCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ControllerTransferCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ForcedTransferCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ProtectedTransferFromByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: BatchForcedTransferCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: BatchTransferCommandHandler,
  },
];

export const QUERY_HANDLERS_TRANSFER = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: CanTransferByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: CanTransferQueryHandler,
  },
];
