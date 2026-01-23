// SPDX-License-Identifier: Apache-2.0

import UpdateExternalKycListsRequest from "@port/in/request/security/externalKycLists/UpdateExternalKycListsRequest";
import { UpdateExternalKycListsCommand } from "@command/security/externalKycLists/updateExternalKycLists/UpdateExternalKycListsCommand";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { AddExternalKycListCommand } from "@command/security/externalKycLists/addExternalKycList/AddExternalKycListCommand";
import { RemoveExternalKycListCommand } from "@command/security/externalKycLists/removeExternalKycList/RemoveExternalKycListCommand";
import AddExternalKycListRequest from "@port/in/request/security/externalKycLists/AddExternalKycListRequest";
import RemoveExternalKycListRequest from "@port/in/request/security/externalKycLists/RemoveExternalKycListRequest";
import { GetExternalKycListsCountQuery } from "@query/security/externalKycLists/getExternalKycListsCount/GetExternalKycListsCountQuery";
import { GetExternalKycListsMembersQuery } from "@query/security/externalKycLists/getExternalKycListsMembers/GetExternalKycListsMembersQuery";
import { IsExternalKycListQuery } from "@query/security/externalKycLists/isExternalKycList/IsExternalKycListQuery";
import { IsExternallyGrantedQuery } from "@query/security/externalKycLists/isExternallyGranted/IsExternallyGrantedQuery";
import IsExternallyGrantedRequest from "@port/in/request/security/externalKycLists/IsExternallyGrantedRequest";
import IsExternalKycListRequest from "@port/in/request/security/externalKycLists/IsExternalKycListRequest";
import GetExternalKycListsMembersRequest from "@port/in/request/security/externalKycLists/GetExternalKycListsMembersRequest";
import GetExternalKycListsCountRequest from "@port/in/request/security/externalKycLists/GetExternalKycListsCountRequest";
import { GrantKycMockCommand } from "@command/security/externalKycLists/mock/grantKycMock/GrantKycMockCommand";
import { RevokeKycMockCommand } from "@command/security/externalKycLists/mock/revokeKycMock/RevokeKycMockCommand";
import { GetKycStatusMockQuery } from "@query/security/externalKycLists/mock/getKycStatusMock/GetKycStatusMockQuery";
import GrantKycMockRequest from "@port/in/request/security/externalKycLists/mock/GrantKycMockRequest";
import RevokeKycMockRequest from "@port/in/request/security/externalKycLists/mock/RevokeKycMockRequest";
import GetKycStatusMockRequest from "@port/in/request/security/externalKycLists/mock/GetKycStatusMockRequest";

export const UpdateExternalKycListsCommandFixture = createFixture<UpdateExternalKycListsCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.externalKycListsAddresses.as(() => [HederaIdPropsFixture.create().value]);
  command.actives.faker((faker) => [faker.datatype.boolean()]);
});

export const AddExternalKycListCommandFixture = createFixture<AddExternalKycListCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.externalKycListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const RemoveExternalKycListCommandFixture = createFixture<RemoveExternalKycListCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.externalKycListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const GrantKycMockCommandFixture = createFixture<GrantKycMockCommand>((command) => {
  command.contractId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const RevokeKycMockCommandFixture = createFixture<RevokeKycMockCommand>((command) => {
  command.contractId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetKycStatusMockQueryFixture = createFixture<GetKycStatusMockQuery>((query) => {
  query.contractId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetExternalKycListsCountQueryFixture = createFixture<GetExternalKycListsCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetExternalKycListsMembersQueryFixture = createFixture<GetExternalKycListsMembersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const IsExternalKycListQueryFixture = createFixture<IsExternalKycListQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.externalKycListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const IsExternallyGrantedQueryFixture = createFixture<IsExternallyGrantedQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.kycStatus.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const UpdateExternalKycListsRequestFixture = createFixture<UpdateExternalKycListsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalKycListsAddresses.as(() => [HederaIdPropsFixture.create().value]);
  request.actives.faker((faker) => [faker.datatype.boolean()]);
});

export const AddExternalKycListsRequestFixture = createFixture<AddExternalKycListRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalKycListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const RemoveExternalKycListsRequestFixture = createFixture<RemoveExternalKycListRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalKycListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const IsExternallyGrantedRequestFixture = createFixture<IsExternallyGrantedRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.kycStatus.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const IsExternalKycListRequestFixture = createFixture<IsExternalKycListRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalKycListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const GetExternalKycListsMembersRequestFixture = createFixture<GetExternalKycListsMembersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetExternalKycListsCountRequestFixture = createFixture<GetExternalKycListsCountRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GrantKycMockRequestFixture = createFixture<GrantKycMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const RevokeKycMockRequestFixture = createFixture<RevokeKycMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetKycStatusMockRequestFixture = createFixture<GetKycStatusMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});
