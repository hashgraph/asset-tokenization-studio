// SPDX-License-Identifier: Apache-2.0

import { HederaIdPropsFixture } from "../shared/DataFixture";
import { createFixture } from "../config";
import { BurnCommand } from "@command/security/operations/burn/BurnCommand";
import { BurnRequest } from "@port/in";

export const BurnRequestFixture = createFixture<BurnRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.sourceId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
});

export const BurnCommandFixture = createFixture<BurnCommand>((command) => {
  command.sourceId.as(() => HederaIdPropsFixture.create().value);
  command.amount.faker((faker) => faker.number.int({ min: 1, max: 1000 }).toString());
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});
