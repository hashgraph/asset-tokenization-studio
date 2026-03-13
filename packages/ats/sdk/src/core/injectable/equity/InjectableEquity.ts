// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { CreateEquityCommandHandler } from "@command/equity/create/CreateEquityCommandHandler";
import { SetDividendCommandHandler } from "@command/equity/dividends/set/SetDividendCommandHandler";
import { CancelDividendCommandHandler } from "@command/equity/dividends/cancel/CancelDividendCommandHandler";
import { SetVotingRightsCommandHandler } from "@command/equity/votingRights/set/SetVotingRightsCommandHandler";
import { CancelVotingCommandHandler } from "@command/equity/votingRights/cancel/CancelVotingCommandHandler";
import { GetDividendForQueryHandler } from "@query/equity/dividends/getDividendFor/GetDividendForQueryHandler";
import { GetDividendAmountForQueryHandler } from "@query/equity/dividends/getDividendAmountFor/GetDividendAmountForQueryHandler";
import { GetDividendQueryHandler } from "@query/equity/dividends/getDividend/GetDividendQueryHandler";
import { GetDividendsCountQueryHandler } from "@query/equity/dividends/getDividendsCount/GetDividendsCountQueryHandler";
import { GetVotingForQueryHandler } from "@query/equity/votingRights/getVotingFor/GetVotingForQueryHandler";
import { GetVotingQueryHandler } from "@query/equity/votingRights/getVoting/GetVotingQueryHandler";
import { GetVotingCountQueryHandler } from "@query/equity/votingRights/getVotingCount/GetVotingCountQueryHandler";
import { GetEquityDetailsQueryHandler } from "@query/equity/get/getEquityDetails/GetEquityDetailsQueryHandler";
import { GetDividendHoldersQueryHandler } from "@query/equity/dividends/getDividendHolders/GetDividendHoldersQueryHandler";
import { GetTotalDividendHoldersQueryHandler } from "@query/equity/dividends/getTotalDividendHolders/GetTotalDividendHoldersQueryHandler";
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
    useClass: SetDividendCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CancelDividendCommandHandler,
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
    useClass: GetDividendForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendAmountForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendsCountQueryHandler,
  },
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
    useClass: GetDividendHoldersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetTotalDividendHoldersQueryHandler,
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
