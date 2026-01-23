// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { SetPausedMockCommandHandler } from "@command/security/externalPauses/mock/setPaused/SetPausedMockCommandHandler";
import { CreateExternalPauseMockCommandHandler } from "@command/security/externalPauses/mock/createExternalPauseMock/CreateExternalPauseMockCommandHandler";
import { UpdateExternalPausesCommandHandler } from "@command/security/externalPauses/updateExternalPauses/UpdateExternalPausesCommandHandler";
import { AddExternalPauseCommandHandler } from "@command/security/externalPauses/addExternalPause/AddExternalPauseCommandHandler";
import { RemoveExternalPauseCommandHandler } from "@command/security/externalPauses/removeExternalPause/RemoveExternalPauseCommandHandler";
import { IsPausedMockQueryHandler } from "@query/security/externalPauses/mock/isPaused/IsPausedMockQueryHandler";
import { IsPausedQueryHandler } from "@query/security/isPaused/IsPausedQueryHandler";
import { GetExternalPausesCountQueryHandler } from "@query/security/externalPauses/getExternalPausesCount/GetExternalPausesCountQueryHandler";
import { GetExternalPausesMembersQueryHandler } from "@query/security/externalPauses/getExternalPausesMembers/GetExternalPausesMembersQueryHandler";
import { IsExternalPauseQueryHandler } from "@query/security/externalPauses/isExternalPause/IsExternalPauseQueryHandler";
import { PauseCommandHandler } from "@command/security/operations/pause/PauseCommandHandler";
import { UnpauseCommandHandler } from "@command/security/operations/unpause/UnpauseCommandHandler";

export const COMMAND_HANDLERS_PAUSE = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetPausedMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateExternalPauseMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UpdateExternalPausesCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddExternalPauseCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveExternalPauseCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: PauseCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UnpauseCommandHandler,
  },
];

export const QUERY_HANDLERS_PAUSE = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsPausedMockQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsPausedQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetExternalPausesCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetExternalPausesMembersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsExternalPauseQueryHandler,
  },
];
