// SPDX-License-Identifier: Apache-2.0

import UpdateExternalControlListsRequest from "@port/in/request/security/externalControlLists/UpdateExternalControlListsRequest";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { UpdateExternalControlListsCommand } from "@command/security/externalControlLists/updateExternalControlLists/UpdateExternalControlListsCommand";
import { AddExternalControlListCommand } from "@command/security/externalControlLists/addExternalControlList/AddExternalControlListCommand";
import { RemoveExternalControlListCommand } from "@command/security/externalControlLists/removeExternalControlList/RemoveExternalControlListCommand";
import AddExternalControlListRequest from "@port/in/request/security/externalControlLists/AddExternalControlListRequest";
import RemoveExternalControlListRequest from "@port/in/request/security/externalControlLists/RemoveExternalControlListRequest";
import { GetExternalControlListsCountQuery } from "@query/security/externalControlLists/getExternalControlListsCount/GetExternalControlListsCountQuery";
import { GetExternalControlListsMembersQuery } from "@query/security/externalControlLists/getExternalControlListsMembers/GetExternalControlListsMembersQuery";
import { IsExternalControlListQuery } from "@query/security/externalControlLists/isExternalControlList/IsExternalControlListQuery";
import IsExternalControlListRequest from "@port/in/request/security/externalControlLists/IsExternalControlListRequest";
import GetExternalControlListsMembersRequest from "@port/in/request/security/externalControlLists/GetExternalControlListsMembersRequest";
import GetExternalControlListsCountRequest from "@port/in/request/security/externalControlLists/GetExternalControlListsCountRequest";
import { AddToBlackListMockCommand } from "@command/security/externalControlLists/mock/addToBlackListMock/AddToBlackListMockCommand";
import { AddToWhiteListMockCommand } from "@command/security/externalControlLists/mock/addToWhiteListMock/AddToWhiteListMockCommand";
import { RemoveFromBlackListMockCommand } from "@command/security/externalControlLists/mock/removeFromBlackListMock/RemoveFromBlackListMockCommand";
import { RemoveFromWhiteListMockCommand } from "@command/security/externalControlLists/mock/removeFromWhiteListMock/RemoveFromWhiteListMockCommand";
import { IsAuthorizedBlackListMockQuery } from "@query/security/externalControlLists/mock/isAuthorizedBlackListMock/IsAuthorizedBlackListMockQuery";
import { IsAuthorizedWhiteListMockQuery } from "@query/security/externalControlLists/mock/isAuthorizedWhiteListMock/IsAuthorizedWhiteListMockQuery";
import AddToBlackListMockRequest from "@port/in/request/security/externalControlLists/mock/AddToBlackListMockRequest";
import AddToWhiteListMockRequest from "@port/in/request/security/externalControlLists/mock/AddToWhiteListMockRequest";
import RemoveFromWhiteListMockRequest from "@port/in/request/security/externalControlLists/mock/RemoveFromWhiteListMockRequest";
import RemoveFromBlackListMockRequest from "@port/in/request/security/externalControlLists/mock/RemoveFromBlackListMockRequest";
import IsAuthorizedBlackListMockRequest from "@port/in/request/security/externalControlLists/mock/IsAuthorizedBlackListMockRequest";
import IsAuthorizedWhiteListMockRequest from "@port/in/request/security/externalControlLists/mock/IsAuthorizedWhiteListMockRequest";

export const UpdateExternalControlListsCommandFixture = createFixture<UpdateExternalControlListsCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.externalControlListsAddresses.as(() => [HederaIdPropsFixture.create().value]);
  command.actives.faker((faker) => [faker.datatype.boolean()]);
});

export const AddExternalControlListCommandFixture = createFixture<AddExternalControlListCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.externalControlListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const RemoveExternalControlListCommandFixture = createFixture<RemoveExternalControlListCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.externalControlListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const AddToBlackListMockCommandFixture = createFixture<AddToBlackListMockCommand>((command) => {
  command.contractId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const AddToWhiteListMockCommandFixture = createFixture<AddToWhiteListMockCommand>((command) => {
  command.contractId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const RemoveFromBlackListMockCommandFixture = createFixture<RemoveFromBlackListMockCommand>((command) => {
  command.contractId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const RemoveFromWhiteListMockCommandFixture = createFixture<RemoveFromWhiteListMockCommand>((command) => {
  command.contractId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const IsAuthorizedBlackListMockQueryFixture = createFixture<IsAuthorizedBlackListMockQuery>((query) => {
  query.contractId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const IsAuthorizedWhiteListMockQueryFixture = createFixture<IsAuthorizedWhiteListMockQuery>((query) => {
  query.contractId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const UpdateExternalControlListsRequestFixture = createFixture<UpdateExternalControlListsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalControlListsAddresses.as(() => [HederaIdPropsFixture.create().value]);
  request.actives.faker((faker) => [faker.datatype.boolean()]);
});

export const GetExternalControlListsCountQueryFixture = createFixture<GetExternalControlListsCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetExternalControlListsMembersQueryFixture = createFixture<GetExternalControlListsMembersQuery>(
  (query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
    query.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  },
);

export const IsExternalControlListQueryFixture = createFixture<IsExternalControlListQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.externalControlListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const IsExternalControlListRequestFixture = createFixture<IsExternalControlListRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalControlListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const GetExternalControlListsMembersRequestFixture = createFixture<GetExternalControlListsMembersRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
    request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  },
);

export const GetExternalControlListsCountRequestFixture = createFixture<GetExternalControlListsCountRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
  },
);

export const AddExternalControlListsRequestFixture = createFixture<AddExternalControlListRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalControlListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const RemoveExternalControlListsRequestFixture = createFixture<RemoveExternalControlListRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalControlListAddress.as(() => HederaIdPropsFixture.create().value);
});

export const AddToBlackListMockRequestFixture = createFixture<AddToBlackListMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const AddToWhiteListMockRequestFixture = createFixture<AddToWhiteListMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const RemoveFromWhiteListMockRequestFixture = createFixture<RemoveFromWhiteListMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const RemoveFromBlackListMockRequestFixture = createFixture<RemoveFromBlackListMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const IsAuthorizedBlackListMockRequestFixture = createFixture<IsAuthorizedBlackListMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const IsAuthorizedWhiteListMockRequestFixture = createFixture<IsAuthorizedWhiteListMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});
