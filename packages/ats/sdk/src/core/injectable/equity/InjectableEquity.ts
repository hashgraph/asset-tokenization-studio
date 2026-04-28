// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { CreateEquityCommandHandler } from "@command/equity/create/CreateEquityCommandHandler";
import { SetVotingRightsCommandHandler } from "@command/equity/votingRights/set/SetVotingRightsCommandHandler";
import { CancelVotingCommandHandler } from "@command/equity/votingRights/cancel/CancelVotingCommandHandler";
import { GetVotingForQueryHandler } from "@query/equity/votingRights/getVotingFor/GetVotingForQueryHandler";
import { GetVotingQueryHandler } from "@query/equity/votingRights/getVoting/GetVotingQueryHandler";
import { GetVotingCountQueryHandler } from "@query/equity/votingRights/getVotingCount/GetVotingCountQueryHandler";
import { GetEquityDetailsQueryHandler } from "@query/equity/get/getEquityDetails/GetEquityDetailsQueryHandler";
import { GetVotingHoldersQueryHandler } from "@query/equity/votingRights/getVotingHolders/GetVotingHoldersQueryHandler";
import { GetTotalVotingHoldersQueryHandler } from "@query/equity/votingRights/getTotalVotingHolders/GetTotalVotingHoldersQueryHandler";
import { CancelScheduledBalanceAdjustmentCommandHandler } from "@command/equity/balanceAdjustments/cancelScheduledBalanceAdjustment/CancelScheduledBalanceAdjustmentCommandHandler";

export const COMMAND_HANDLERS_EQUITY = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateEquityCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetVotingRightsCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CancelScheduledBalanceAdjustmentCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CancelVotingCommandHandler,
  },
];

export const QUERY_HANDLERS_EQUITY = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetVotingForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetVotingQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetVotingCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetEquityDetailsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetVotingHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalVotingHoldersQueryHandler,
  },
];
