// SPDX-License-Identifier: Apache-2.0

import { GetHoldCountForByPartitionQueryHandler } from "@query/security/hold/getHoldCountForByPartition/GetHoldCountForByPartitionQueryHandler";
import { ControllerCreateHoldByPartitionCommandHandler } from "@command/security/operations/hold/controllerCreateHoldByPartition/ControllerCreateHoldByPartitionCommandHandler";
import { CreateHoldByPartitionCommandHandler } from "@command/security/operations/hold/createHoldByPartition/CreateHoldByPartitionCommandHandler";
import { CreateHoldFromByPartitionCommandHandler } from "@command/security/operations/hold/createHoldFromByPartition/CreateHoldFromByPartitionCommandHandler";
import { ProtectedCreateHoldByPartitionCommandHandler } from "@command/security/operations/hold/protectedCreateHoldByPartition/ProtectedCreateHoldByPartitionCommandHandler";
import { TOKENS } from "../Tokens";
import { GetHoldsIdForByPartitionQueryHandler } from "@query/security/hold/getHoldsIdForByPartition/GetHoldsIdForByPartitionQueryHandler";
import { GetHoldForByPartitionQueryHandler } from "@query/security/hold/getHoldForByPartition/GetHoldForByPartitionQueryHandler";
import { GetHeldAmountForQueryHandler } from "@query/security/hold/getHeldAmountFor/GetHeldAmountForQueryHandler";
import { GetHeldAmountForByPartitionQueryHandler } from "@query/security/hold/getHeldAmountForByPartition/GetHeldAmountForByPartitionQueryHandler";
import { ReleaseHoldByPartitionCommandHandler } from "@command/security/operations/hold/releaseHoldByPartition/ReleaseHoldByPartitionCommandHandler";
import { ReclaimHoldByPartitionCommandHandler } from "@command/security/operations/hold/reclaimHoldByPartition/ReclaimHoldByPartitionCommandHandler";
import { ExecuteHoldByPartitionCommandHandler } from "@command/security/operations/hold/executeHoldByPartition/ExecuteHoldByPartitionCommandHandler";

export const COMMAND_HANDLERS_HOLD = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateHoldByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateHoldFromByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ControllerCreateHoldByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ProtectedCreateHoldByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ReleaseHoldByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ReclaimHoldByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ExecuteHoldByPartitionCommandHandler,
  },
];

export const QUERY_HANDLERS_HOLD = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetHeldAmountForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetHeldAmountForByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetHoldCountForByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetHoldsIdForByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetHoldForByPartitionQueryHandler,
  },
];
