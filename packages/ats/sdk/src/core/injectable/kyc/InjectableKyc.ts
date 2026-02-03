// SPDX-License-Identifier: Apache-2.0

import { UpdateExternalKycListsCommandHandler } from "@command/security/externalKycLists/updateExternalKycLists/UpdateExternalKycListsCommandHandler";
import { TOKENS } from "../Tokens";
import { AddExternalKycListCommandHandler } from "@command/security/externalKycLists/addExternalKycList/AddExternalKycListCommandHandler";
import { RemoveExternalKycListCommandHandler } from "@command/security/externalKycLists/removeExternalKycList/RemoveExternalKycListCommandHandler";
import { ActivateInternalKycCommandHandler } from "@command/security/kyc/activateInternalKyc/ActivateInternalKycCommandHandler";
import { DeactivateInternalKycCommandHandler } from "@command/security/kyc/deactivateInternalKyc/DeactivateInternalKycCommandHandler";
import { GrantKycCommandHandler } from "@command/security/kyc/grantKyc/GrantKycCommandHandler";
import { RevokeKycCommandHandler } from "@command/security/kyc/revokeKyc/RevokeKycCommandHandler";
import { GrantKycMockCommandHandler } from "@command/security/externalKycLists/mock/grantKycMock/GrantKycMockCommandHandler";
import { RevokeKycMockCommandHandler } from "@command/security/externalKycLists/mock/revokeKycMock/RevokeKycMockCommandHandler";
import { CreateExternalKycListMockCommandHandler } from "@command/security/externalKycLists/mock/createExternalKycMock/CreateExternalKycMockCommandHandler";
import { GetKycStatusMockQueryHandler } from "@query/security/externalKycLists/mock/getKycStatusMock/GetKycStatusMockQueryHandler";
import { GetKycForQueryHandler } from "@query/security/kyc/getKycFor/GetKycForQueryHandler";
import { GetKycAccountsCountQueryHandler } from "@query/security/kyc/getKycAccountsCount/GetKycAccountsCountQueryHandler";
import { GetKycAccountsDataQueryHandler } from "@query/security/kyc/getKycAccountsData/GetKycAccountsDataQueryHandler";
import { GetKycStatusForQueryHandler } from "@query/security/kyc/getKycStatusFor/GetKycStatusForQueryHandler";
import { GetIssuerListCountQueryHandler } from "@query/security/ssi/getIssuerListCount/GetIssuerListCountQueryHandler";
import { GetIssuerListMembersQueryHandler } from "@query/security/ssi/getIssuerListMembers/GetIssuerListMembersQueryHandler";
import { GetRevocationRegistryAddressQueryHandler } from "@query/security/ssi/getRevocationRegistryAddress/GetRevocationRegistryAddressQueryHandler";
import { IsIssuerQueryHandler } from "@query/security/ssi/isIssuer/IsIssuerQueryHandler";
import { GetExternalKycListsCountQueryHandler } from "@query/security/externalKycLists/getExternalKycListsCount/GetExternalKycListsCountQueryHandler";
import { GetExternalKycListsMembersQueryHandler } from "@query/security/externalKycLists/getExternalKycListsMembers/GetExternalKycListsMembersQueryHandler";
import { IsExternalKycListQueryHandler } from "@query/security/externalKycLists/isExternalKycList/IsExternalKycListQueryHandler";
import { IsExternallyGrantedQueryHandler } from "@query/security/externalKycLists/isExternallyGranted/IsExternallyGrantedQueryHandler";
import { IsInternalKycActivatedQueryHandler } from "@query/security/kyc/isInternalKycActivated/IsInternalKycActivatedQueryHandler";
import { AddIssuerCommandHandler } from "@command/security/ssi/addIssuer/AddIssuerCommandHandler";
import { RemoveIssuerCommandHandler } from "@command/security/ssi/removeIssuer/RemoveIssuerCommandHandler";
import { SetRevocationRegistryAddressCommandHandler } from "@command/security/ssi/setRevocationRegistryAddress/SetRevocationRegistryAddressCommandHandler";
import { ActionContentHashExistsQueryHandler } from "@query/security/actionContentHashExists/ActionContentHashExistsQueryHandler";

export const COMMAND_HANDLERS_KYC = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UpdateExternalKycListsCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddExternalKycListCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveExternalKycListCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ActivateInternalKycCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: DeactivateInternalKycCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: GrantKycCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RevokeKycCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: GrantKycMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RevokeKycMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateExternalKycListMockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddIssuerCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveIssuerCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetRevocationRegistryAddressCommandHandler,
  },
];

export const QUERY_HANDLERS_KYC = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetKycStatusMockQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetKycForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetKycAccountsCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetKycAccountsDataQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetKycStatusForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetIssuerListCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetIssuerListMembersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRevocationRegistryAddressQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsIssuerQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetExternalKycListsCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetExternalKycListsMembersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsExternalKycListQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsExternallyGrantedQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsInternalKycActivatedQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: ActionContentHashExistsQueryHandler,
  },
];
