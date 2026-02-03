// SPDX-License-Identifier: Apache-2.0

import { FreezePartialTokensCommand } from "@command/security/operations/freeze/freezePartialTokens/FreezePartialTokensCommand";
import { UnfreezePartialTokensCommand } from "@command/security/operations/freeze/unfreezePartialTokens/UnfreezePartialTokensCommand";
import { GetFrozenPartialTokensQuery } from "@query/security/freeze/getFrozenPartialTokens/GetFrozenPartialTokensQuery";
import { FreezePartialTokensRequest, UnfreezePartialTokensRequest, SetAddressFrozenRequest } from "src";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { SetAddressFrozenCommand } from "@command/security/operations/freeze/setAddressFrozen/SetAddressFrozenCommand";

export const SetAddressFrozenCommandFixture = createFixture<SetAddressFrozenCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.status.faker((faker) => faker.datatype.boolean());
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});
export const SetAddressFrozenRequestFixture = createFixture<SetAddressFrozenRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.status.faker((faker) => faker.datatype.boolean());
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const FreezePartialTokensCommandFixture = createFixture<FreezePartialTokensCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const FreezePartialTokensRequestFixture = createFixture<FreezePartialTokensRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const UnfreezePartialTokensCommandFixture = createFixture<UnfreezePartialTokensCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const UnfreezePartialTokensRequestFixture = createFixture<UnfreezePartialTokensRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetFrozenPartialTokensQueryFixture = createFixture<GetFrozenPartialTokensQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});
