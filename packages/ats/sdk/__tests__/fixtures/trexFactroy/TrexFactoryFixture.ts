// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { GetTokenBySaltQuery } from "@query/factory/trex/getTokenBySalt/GetTokenBySaltQuery";
import { HederaIdPropsFixture } from "../shared/DataFixture";

export const GetTokenQueryFixture = createFixture<GetTokenBySaltQuery>((query) => {
  query.salt.faker((faker) => faker.string.alphanumeric());
  query.factory?.as(() => HederaIdPropsFixture.create().value);
});
