// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { SetCustomDataCommand } from "@command/security/operations/customData/setCustomData/SetCustomDataCommand";
import SetCustomDataRequest from "@port/in/request/security/operations/customData/SetCustomDataRequest";

export const SetCustomDataCommandFixture = createFixture<SetCustomDataCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.key.faker((faker) => faker.string.alpha({ length: 10 }));
  command.value.as(() => ["value1", "value2"]);
});

export const SetCustomDataRequestFixture = createFixture<SetCustomDataRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.key.faker((faker) => faker.string.alpha({ length: 10 }));
  request.value.as(() => ["value1", "value2"]);
});
