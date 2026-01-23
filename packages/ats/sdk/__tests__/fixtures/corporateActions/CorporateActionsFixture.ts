// SPDX-License-Identifier: Apache-2.0

import { HederaIdPropsFixture } from "../shared/DataFixture";
import { createFixture } from "../config";

import { ActionContentHashExistsQuery } from "@query/security/actionContentHashExists/ActionContentHashExistsQuery";
import ActionContentHashExistsRequest from "@port/in/request/security/operations/corporateActions/ActionContentHashExistsRequest";

export const ActionContentHashExistsQueryFixture = createFixture<ActionContentHashExistsQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.contentHash.faker((faker) => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`);
});

export const ActionContentHashExistsRequestFixture = createFixture<ActionContentHashExistsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.contentHash.faker((faker) => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`);
});
