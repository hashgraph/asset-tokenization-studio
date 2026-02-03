// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { SetIdentityRegistryCommand } from "@command/security/identityRegistry/setIdentityRegistry/SetIdentityRegistryCommand";
import { IdentityRegistryQuery } from "@query/security/identityRegistry/IdentityRegistryQuery";
import SetIdentityRegistryRequest from "@port/in/request/security/identityRegistry/SetIdentityRegistryRequest";
import IdentityRegistryRequest from "@port/in/request/security/identityRegistry/IdentityRegistryRequest";

export const SetIdentityRegistryCommandFixture = createFixture<SetIdentityRegistryCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.identityRegistry.as(() => HederaIdPropsFixture.create().value);
});

export const IdentityRegistryQueryFixture = createFixture<IdentityRegistryQuery>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const SetIdentityRegistryRequestFixture = createFixture<SetIdentityRegistryRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.identityRegistry.as(() => HederaIdPropsFixture.create().value);
});

export const IdentityRegistryRequestFixture = createFixture<IdentityRegistryRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});
