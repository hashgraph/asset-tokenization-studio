// SPDX-License-Identifier: Apache-2.0

import { HederaIdPropsFixture } from "../shared/DataFixture";
import { createFixture } from "../config";
import { DeactivateCommand } from "@command/security/operations/deactivate/DeactivateCommand";
import DeactivateRequest from "@port/in/request/security/operations/deactivate/DeactivateRequest";

export const DeactivateRequestFixture = createFixture<DeactivateRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const DeactivateCommandFixture = createFixture<DeactivateCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});
