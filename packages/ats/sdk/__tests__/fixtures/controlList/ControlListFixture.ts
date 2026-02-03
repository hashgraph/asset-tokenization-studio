// SPDX-License-Identifier: Apache-2.0

import { HederaIdPropsFixture } from "../shared/DataFixture";
import { createFixture } from "../config";
import { GetControlListCountQuery } from "@query/security/controlList/getControlListCount/GetControlListCountQuery";
import { GetControlListMembersQuery } from "@query/security/controlList/getControlListMembers/GetControlListMembersQuery";
import { GetControlListTypeQuery } from "@query/security/controlList/getControlListType/GetControlListTypeQuery";
import ControlListRequest from "@port/in/request/security/operations/controlList/ControlListRequest";
import GetControlListCountRequest from "@port/in/request/security/operations/controlList/GetControlListCountRequest";
import GetControlListMembersRequest from "@port/in/request/security/operations/controlList/GetControlListMembersRequest";
import GetControlListTypeRequest from "@port/in/request/security/operations/controlList/GetControlListTypeRequest";
import { AddToControlListCommand } from "@command/security/operations/addToControlList/AddToControlListCommand";

export const GetControlListCountQueryFixture = createFixture<GetControlListCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetControlListMembersQueryFixture = createFixture<GetControlListMembersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetControlListTypeQueryFixture = createFixture<GetControlListTypeQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const ControlListRequestFixture = createFixture<ControlListRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetControlListCountRequestFixture = createFixture<GetControlListCountRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetControlListMembersRequestFixture = createFixture<GetControlListMembersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetControlListTypeRequestFixture = createFixture<GetControlListTypeRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const AddToControlListCommandFixture = createFixture<AddToControlListCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});
