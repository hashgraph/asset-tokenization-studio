// SPDX-License-Identifier: Apache-2.0

import { IsOperatorForPartitionQueryHandler } from "@query/security/operator/isOperatorForPartition/IsOperatorForPartitionQueryHandler";
import { TOKENS } from "../Tokens";
import { IsOperatorQueryHandler } from "@query/security/operator/isOperator/IsOperatorQueryHandler";

export const QUERY_HANDLERS_OPERATOR = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsOperatorForPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsOperatorQueryHandler,
  },
];
