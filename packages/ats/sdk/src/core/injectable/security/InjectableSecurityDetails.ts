// SPDX-License-Identifier: Apache-2.0

import { GetSecurityQueryHandler } from "@query/security/get/GetSecurityQueryHandler";
import { TOKENS } from "../Tokens";
import { GetRegulationDetailsQueryHandler } from "@query/factory/get/GetRegulationDetailsQueryHandler";
import { GetSecurityHoldersQueryHandler } from "@query/security/security/getSecurityHolders/GetSecurityHoldersQueryHandler";
import { GetTotalSecurityHoldersQueryHandler } from "@query/security/security/getTotalSecurityHolders/GetTotalSecurityHoldersQueryHandler";

export const QUERY_HANDLERS_SECURITY_DETAILS = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetSecurityQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRegulationDetailsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetSecurityHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalSecurityHoldersQueryHandler,
  },
];
