// SPDX-License-Identifier: Apache-2.0

import { ProtectedRedeemFromByPartitionCommand } from "@command/security/operations/redeem/ProtectedRedeemFromByPartitionCommand";
import { HederaIdPropsFixture, PartitionIdFixture } from "../shared/DataFixture";
import { createFixture } from "../config";
import RedeemRequest from "@port/in/request/security/operations/redeem/RedeemRequest";
import ForceRedeemRequest from "@port/in/request/security/operations/redeem/ForceRedeemRequest";

export const RedeemCommandFixture = createFixture<ProtectedRedeemFromByPartitionCommand>((command) => {
  command.amount.faker((faker) => faker.number.int({ min: 1, max: 1000 }).toString());
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.sourceId.as(() => HederaIdPropsFixture.create().value);
  command.partitionId.as(() => PartitionIdFixture.create().value);
  command.deadline.faker((faker) => faker.date.future().getTime().toString());
  command.nounce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  command.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
});

export const RedeemRequestFixture = createFixture<RedeemRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
});

export const ForceRedeemRequestFixture = createFixture<ForceRedeemRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.sourceId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
});
