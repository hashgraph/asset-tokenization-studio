// SPDX-License-Identifier: Apache-2.0

import { HederaIdPropsFixture } from "../shared/DataFixture";
import { createFixture } from "../config";
import { RecoveryAddressCommand } from "@command/security/operations/recoveryAddress/RecoveryAddressCommand";
import { IsAddressRecoveredQuery } from "@query/security/recovery/IsAddressRecoveredQuery";
import { RecoveryAddressRequest, IsAddressRecoveredRequest } from "@port/in";

export const IsAddressRecoveredQueryFixture = createFixture<IsAddressRecoveredQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const RecoveryAddressCommandFixture = createFixture<RecoveryAddressCommand>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.lostWalletId.as(() => HederaIdPropsFixture.create().value);
  request.newWalletId.as(() => HederaIdPropsFixture.create().value);
});

export const RecoveryAddressRequestFixture = createFixture<RecoveryAddressRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.lostWalletId.as(() => HederaIdPropsFixture.create().value);
  request.newWalletId.as(() => HederaIdPropsFixture.create().value);
});

export const IsAddressRecoveredRequestFixture = createFixture<IsAddressRecoveredRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});
