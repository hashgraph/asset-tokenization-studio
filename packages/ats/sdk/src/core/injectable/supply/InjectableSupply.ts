// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { SetMaxSupplyCommandHandler } from "@command/security/operations/cap/SetMaxSupplyCommandHandler";
import { GetMaxSupplyQueryHandler } from "@query/security/cap/getMaxSupply/GetMaxSupplyQueryHandler";
import { GetMaxSupplyByPartitionQueryHandler } from "@query/security/cap/getMaxSupplyByPartition/GetMaxSupplyByPartitionQueryHandler";
import { GetTotalSupplyByPartitionQueryHandler } from "@query/security/cap/getTotalSupplyByPartition/GetTotalSupplyByPartitionQueryHandler";

export const COMMAND_HANDLERS_SUPPLY = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetMaxSupplyCommandHandler,
  },
];

export const QUERY_HANDLERS_SUPPLY = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetMaxSupplyQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetMaxSupplyByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalSupplyByPartitionQueryHandler,
  },
];
