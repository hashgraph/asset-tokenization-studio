// SPDX-License-Identifier: Apache-2.0

import { GetNounceQuery } from "@query/security/protectedPartitions/getNounce/GetNounceQuery";
import { HederaIdPropsFixture, PartitionIdFixture } from "../shared/DataFixture";
import { createFixture } from "../config";
import ProtectedTransferFromByPartitionRequest from "@port/in/request/security/operations/transfer/ProtectedTransferFromByPartitionRequest";
import ProtectedRedeemFromByPartitionRequest from "@port/in/request/security/operations/redeem/ProtectedRedeemFromByPartitionRequest";
import PartitionsProtectedRequest from "@port/in/request/security/operations/protectedPartitions/PartitionsProtectedRequest";
import GetNounceRequest from "@port/in/request/security/operations/protectedPartitions/GetNounceRequest";
import { ProtectPartitionsCommand } from "@command/security/operations/protectPartitions/ProtectPartitionsCommand";

export const ProtectedTransferFromByPartitionRequestFixture = createFixture<ProtectedTransferFromByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.deadline.faker((faker) => faker.date.future().getTime().toString());
    request.nounce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    request.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  },
);

export const ProtectedRedeemFromByPartitionRequestFixture = createFixture<ProtectedRedeemFromByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.deadline.faker((faker) => faker.date.future().getTime().toString());
    request.nounce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    request.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  },
);

export const PartitionsProtectedRequestFixture = createFixture<PartitionsProtectedRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetNounceQueryFixture = createFixture<GetNounceQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});
export const GetNounceRequestFixture = createFixture<GetNounceRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const ProtectPartitionsCommandFixture = createFixture<ProtectPartitionsCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});
