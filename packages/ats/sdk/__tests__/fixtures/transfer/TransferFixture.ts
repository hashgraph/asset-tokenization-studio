// SPDX-License-Identifier: Apache-2.0

import { ProtectedTransferFromByPartitionCommand } from "@command/security/operations/transfer/ProtectedTransferFromByPartitionCommand";
import { TransferAndLockCommand } from "@command/security/operations/transfer/TransferAndLockCommand";
import { createFixture } from "../config";
import { HederaIdPropsFixture, PartitionIdFixture } from "../shared/DataFixture";
import TransferRequest from "@port/in/request/security/operations/transfer/TransferRequest";
import TransferAndLockRequest from "@port/in/request/security/operations/transfer/TransferAndLockRequest";
import ForceTransferRequest from "@port/in/request/security/operations/transfer/ForceTransferRequest";
import { ForcedTransferCommand } from "@command/security/operations/transfer/ForcedTransferCommand";
import ForcedTransferRequest from "@port/in/request/security/operations/transfer/ForcedTransferRequest";

export const TransferAndLockCommandFixture = createFixture<TransferAndLockCommand>((command) => {
  command.amount.faker((faker) => faker.number.int({ min: 1, max: 1000 }).toString());
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.expirationDate.faker((faker) => faker.date.future().getTime().toString());
});

export const TransferCommandFixture = createFixture<ProtectedTransferFromByPartitionCommand>((command) => {
  command.amount.faker((faker) => faker.number.int({ min: 1, max: 1000 }).toString());
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.sourceId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.partitionId.as(() => PartitionIdFixture.create().value);
  command.deadline.faker((faker) => faker.date.future().getTime().toString());
  command.nounce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  command.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
});

export const TransferRequestFixture = createFixture<TransferRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
});

export const TransferAndLockRequestFixture = createFixture<TransferAndLockRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
});

export const ForceTransferRequestFixture = createFixture<ForceTransferRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.sourceId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
});

export const ForcedTransferRequestFixture = createFixture<ForcedTransferRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.sourceId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
});

export const FocedTransferCommandFixture = createFixture<ForcedTransferCommand>((command) => {
  command.sourceId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});
