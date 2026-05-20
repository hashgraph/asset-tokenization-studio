// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { SetMetadataCommand } from "@command/security/operations/metadata/setMetadata/SetMetadataCommand";
import SetMetadataRequest from "@port/in/request/security/operations/metadata/SetMetadataRequest";

export const SetMetadataCommandFixture = createFixture<SetMetadataCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.key.faker((faker) => faker.string.alpha({ length: 10 }));
  command.value.as(() => ["value1", "value2"]);
});

export const SetMetadataRequestFixture = createFixture<SetMetadataRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.key.faker((faker) => faker.string.alpha({ length: 10 }));
  request.value.as(() => ["value1", "value2"]);
});
