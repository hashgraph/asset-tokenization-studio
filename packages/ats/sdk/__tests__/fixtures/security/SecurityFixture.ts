// SPDX-License-Identifier: Apache-2.0

import { GetSecurityHoldersQuery } from "@query/security/security/getSecurityHolders/GetSecurityHoldersQuery";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { GetTotalSecurityHoldersQuery } from "@query/security/security/getTotalSecurityHolders/GetTotalSecurityHoldersQuery";
import GetSecurityHoldersRequest from "@port/in/request/security/GetSecurityHoldersRequest";
import GetTotalSecurityHoldersRequest from "@port/in/request/security/GetTotalSecurityHoldersRequest";

export const GetSecurityHoldersQueryFixture = createFixture<GetSecurityHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalSecurityHoldersQueryFixture = createFixture<GetTotalSecurityHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetSecurityHoldersRequestFixture = createFixture<GetSecurityHoldersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalSecurityHoldersRequestFixture = createFixture<GetTotalSecurityHoldersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});
