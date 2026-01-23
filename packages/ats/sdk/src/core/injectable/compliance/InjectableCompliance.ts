// SPDX-License-Identifier: Apache-2.0

import { SetComplianceCommandHandler } from "@command/security/compliance/setCompliance/SetComplianceCommandHandler";
import { TOKENS } from "../Tokens";
import { ComplianceQueryHandler } from "@query/security/compliance/compliance/ComplianceQueryHandler";

export const COMMAND_HANDLERS_COMPLIANCE = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetComplianceCommandHandler,
  },
];

export const QUERY_HANDLERS_COMPLIANCE = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: ComplianceQueryHandler,
  },
];
