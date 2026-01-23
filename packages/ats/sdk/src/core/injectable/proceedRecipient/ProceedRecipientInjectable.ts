// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { AddProceedRecipientCommandHandler } from "@command/security/proceedRecipients/addProceedRecipient/AddProceedRecipientCommandHandler";
import { RemoveProceedRecipientCommandHandler } from "@command/security/proceedRecipients/removeProceedRecipient/RemoveProceedRecipientCommandHandler";
import { UpdateProceedRecipientDataCommandHandler } from "@command/security/proceedRecipients/updateProceedRecipientData/UpdateProceedRecipientDataCommandHandler";
import { GetProceedRecipientsQueryHandler } from "@query/security/proceedRecipient/getProceedRecipients/GetProceedRecipientsQueryHandler";
import { GetProceedRecipientsCountQueryHandler } from "@query/security/proceedRecipient/getProceedRecipientsCount/GetProceedRecipientsCountQueryHandler";
import { GetProceedRecipientDataQueryHandler } from "@query/security/proceedRecipient/getProceedRecipientData/GetProceedRecipientDataQueryHandler";
import { IsProceedRecipientQueryHandler } from "@query/security/proceedRecipient/isProceedRecipient/IsProceedRecipientQueryHandler";

export const COMMAND_HANDLERS_PROCEED_RECIPIENT = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddProceedRecipientCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveProceedRecipientCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UpdateProceedRecipientDataCommandHandler,
  },
];

export const QUERY_HANDLERS_PROCEED_RECIPIENT = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsProceedRecipientQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetProceedRecipientDataQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetProceedRecipientsCountQueryHandler,
  },
  { token: TOKENS.QUERY_HANDLER, useClass: GetProceedRecipientsQueryHandler },
];
