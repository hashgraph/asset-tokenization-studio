// SPDX-License-Identifier: Apache-2.0

import { AddToControlListCommandHandler } from "@command/security/operations/addToControlList/AddToControlListCommandHandler";
import { TOKENS } from "../Tokens";
import { RemoveFromControlListCommandHandler } from "@command/security/operations/removeFromControlList/RemoveFromControlListCommandHandler";
import { UpdateExternalControlListsCommandHandler } from "@command/security/externalControlLists/updateExternalControlLists/UpdateExternalControlListsCommandHandler";
import { AddExternalControlListCommandHandler } from "@command/security/externalControlLists/addExternalControlList/AddExternalControlListCommandHandler";
import { RemoveExternalControlListCommandHandler } from "@command/security/externalControlLists/removeExternalControlList/RemoveExternalControlListCommandHandler";
import { GetControlListCountQueryHandler } from "@query/security/controlList/getControlListCount/GetControlListCountQueryHandler";
import { GetControlListMembersQueryHandler } from "@query/security/controlList/getControlListMembers/GetControlListMembersQueryHandler";
import { IsInControlListQueryHandler } from "@query/account/controlList/IsInControlListQueryHandler";
import { GetControlListTypeQueryHandler } from "@query/security/controlList/getControlListType/GetControlListTypeQueryHandler";
import { IsExternalControlListQueryHandler } from "@query/security/externalControlLists/isExternalControlList/IsExternalControlListQueryHandler";
import { GetExternalControlListsCountQueryHandler } from "@query/security/externalControlLists/getExternalControlListsCount/GetExternalControlListsCountQueryHandler";
import { GetExternalControlListsMembersQueryHandler } from "@query/security/externalControlLists/getExternalControlListsMembers/GetExternalControlListsMembersQueryHandler";
import { AddToBlackListMockCommandHandler } from "@command/security/externalControlLists/mock/addToBlackListMock/AddToBlackListMockCommandHandler";
import { AddToWhiteListMockCommandHandler } from "@command/security/externalControlLists/mock/addToWhiteListMock/AddToWhiteListMockCommandHandler";
import { CreateExternalWhiteListMockCommandHandler } from "@command/security/externalControlLists/mock/createExternalWhiteListMock/CreateExternalWhiteListMockCommandHandler";
import { CreateExternalBlackListMockCommandHandler } from "@command/security/externalControlLists/mock/createExternalBlackListMock/CreateExternalBlackListMockCommandHandler";
import { RemoveFromBlackListMockCommandHandler } from "@command/security/externalControlLists/mock/removeFromBlackListMock/RemoveFromBlackListMockCommandHandler";
import { RemoveFromWhiteListMockCommandHandler } from "@command/security/externalControlLists/mock/removeFromWhiteListMock/RemoveFromWhiteListMockCommandHandler";
import { IsAuthorizedBlackListMockQueryHandler } from "@query/security/externalControlLists/mock/isAuthorizedBlackListMock/IsAuthorizedBlackListMockQueryHandler";
import { IsAuthorizedWhiteListMockQueryHandler } from "@query/security/externalControlLists/mock/isAuthorizedWhiteListMock/IsAuthorizedWhiteListMockQueryHandler";

export const COMMAND_HANDLERS_CONTROL_LIST = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddToControlListCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveFromControlListCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UpdateExternalControlListsCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddExternalControlListCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveExternalControlListCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddToBlackListMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddToWhiteListMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateExternalWhiteListMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateExternalBlackListMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveFromBlackListMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveFromWhiteListMockCommandHandler,
  },
];

export const QUERY_HANDLERS_CONTROL_LIST = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetControlListCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetControlListMembersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsInControlListQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetControlListTypeQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsExternalControlListQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetExternalControlListsCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetExternalControlListsMembersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsAuthorizedBlackListMockQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsAuthorizedWhiteListMockQueryHandler,
  },
];
