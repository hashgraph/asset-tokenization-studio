// SPDX-License-Identifier: Apache-2.0

import { HederaIdPropsFixture } from "../shared/DataFixture";
import { createFixture } from "../config";

import { ActionContentHashExistsQuery } from "@query/security/actionContentHashExists/ActionContentHashExistsQuery";
import ActionContentHashExistsRequest from "@port/in/request/security/operations/corporateActions/ActionContentHashExistsRequest";
import { GetCorporateActionQuery } from "@query/security/getCorporateAction/GetCorporateActionQuery";
import GetCorporateActionRequest from "@port/in/request/security/operations/corporateActions/GetCorporateActionRequest";
import GetCorporateActionResponse from "@port/in/response/corporateActions/GetCorporateActionResponse";
import { GetCorporateActionsQuery } from "@query/security/getCorporateActions/GetCorporateActionsQuery";
import GetCorporateActionsRequest from "@port/in/request/security/operations/corporateActions/GetCorporateActionsRequest";
import GetCorporateActionsResponse from "@port/in/response/corporateActions/GetCorporateActionsResponse";
import { GetCorporateActionsByTypeQuery } from "@query/security/getCorporateActionsByType/GetCorporateActionsByTypeQuery";
import GetCorporateActionsByTypeRequest from "@port/in/request/security/operations/corporateActions/GetCorporateActionsByTypeRequest";

export const ActionContentHashExistsQueryFixture = createFixture<ActionContentHashExistsQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.contentHash.faker((faker) => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`);
});

export const ActionContentHashExistsRequestFixture = createFixture<ActionContentHashExistsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.contentHash.faker((faker) => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`);
});

export const GetCorporateActionRequestFixture = createFixture<GetCorporateActionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.corporateActionId.faker((faker) => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`);
});

export const GetCorporateActionQueryFixture = createFixture<GetCorporateActionQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.corporateActionId.faker((faker) => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`);
});

export const GetCorporateActionResponseFixture = createFixture<GetCorporateActionResponse>((response) => {
  response.actionType.faker((faker) => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`);
  response.actionTypeId.faker((faker) => faker.number.int({ min: 1, max: 100 }));
  response.data.faker((faker) => `0x${faker.string.hexadecimal({ length: 128, prefix: "" })}`);
  response.isDisabled.faker((faker) => faker.datatype.boolean());
});

export const GetCorporateActionsRequestFixture = createFixture<GetCorporateActionsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 100 }));
});

export const GetCorporateActionsQueryFixture = createFixture<GetCorporateActionsQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker: any) => faker.number.int({ min: 0, max: 10 }));
  query.end.faker((faker: any) => faker.number.int({ min: 1, max: 100 }));
});

export const GetCorporateActionsResponseFixture = createFixture<GetCorporateActionsResponse>((response) => {
  response.actionTypes.faker((faker) =>
    Array.from(
      { length: faker.number.int({ min: 1, max: 5 }) },
      () => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`,
    ),
  );
  response.actionTypeIds.faker((faker) =>
    Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.number.int({ min: 1, max: 100 })),
  );
  response.datas.faker((faker) =>
    Array.from(
      { length: faker.number.int({ min: 1, max: 5 }) },
      () => `0x${faker.string.hexadecimal({ length: 128, prefix: "" })}`,
    ),
  );
  response.isDisabled.faker((faker) =>
    Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.datatype.boolean()),
  );
});

export const GetCorporateActionsByTypeRequestFixture = createFixture<GetCorporateActionsByTypeRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.actionType.faker((faker) => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`);
  request.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 100 }));
});

export const GetCorporateActionsByTypeQueryFixture = createFixture<GetCorporateActionsByTypeQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.actionType.faker((faker: any) => `0x${faker.string.hexadecimal({ length: 64, prefix: "" })}`);
  query.start.faker((faker: any) => faker.number.int({ min: 0, max: 10 }));
  query.end.faker((faker: any) => faker.number.int({ min: 1, max: 100 }));
});
