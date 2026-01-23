// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture, PartitionIdFixture } from "../shared/DataFixture";

import CreateHoldByPartitionRequest from "@port/in/request/security/operations/hold/CreateHoldByPartition";
import CreateHoldFromByPartitionRequest from "@port/in/request/security/operations/hold/CreateHoldFromByPartition";
import ControllerCreateHoldByPartitionRequest from "@port/in/request/security/operations/hold/ControllerCreateHoldFromByPartition";
import ProtectedCreateHoldByPartitionRequest from "@port/in/request/security/operations/hold/ProtectedCreateHoldFromByPartition";
import GetHeldAmountForRequest from "@port/in/request/security/operations/hold/GetHeldAmountForRequest";
import GetHeldAmountForByPartitionRequest from "@port/in/request/security/operations/hold/GetHeldAmountForByPartitionRequest";
import GetHoldCountForByPartitionRequest from "@port/in/request/security/operations/hold/GetHoldCountForByPartitionRequest";
import GetHoldsIdForByPartitionRequest from "@port/in/request/security/operations/hold/GetHoldsIdForByPartitionRequest";
import GetHoldForByPartitionRequest from "@port/in/request/security/operations/hold/GetHoldForByPartitionRequest";
import ReleaseHoldByPartitionRequest from "@port/in/request/security/operations/release/ReleaseHoldByPartitionRequest";
import ReclaimHoldByPartitionRequest from "@port/in/request/security/operations/hold/ReclaimHoldByPartitionRequest";
import ExecuteHoldByPartitionRequest from "@port/in/request/security/operations/hold/ExecuteHoldByPartitionRequest";
import { BigNumber } from "ethers";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { GetHeldAmountForQuery } from "@query/security/hold/getHeldAmountFor/GetHeldAmountForQuery";
import { GetHeldAmountForByPartitionQuery } from "@query/security/hold/getHeldAmountForByPartition/GetHeldAmountForByPartitionQuery";
import { GetHoldCountForByPartitionQuery } from "@query/security/hold/getHoldCountForByPartition/GetHoldCountForByPartitionQuery";
import { GetHoldForByPartitionQuery } from "@query/security/hold/getHoldForByPartition/GetHoldForByPartitionQuery";
import { HoldDetails } from "@domain/context/security/Hold";
import { GetHoldsIdForByPartitionQuery } from "@query/security/hold/getHoldsIdForByPartition/GetHoldsIdForByPartitionQuery";
import { ExecuteHoldByPartitionCommand } from "@command/security/operations/hold/executeHoldByPartition/ExecuteHoldByPartitionCommand";
import { ProtectedCreateHoldByPartitionCommand } from "@command/security/operations/hold/protectedCreateHoldByPartition/ProtectedCreateHoldByPartitionCommand";

export const CreateHoldByPartitionRequestFixture = createFixture<CreateHoldByPartitionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.partitionId.as(() => PartitionIdFixture.create().value);
  request.escrowId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
});

export const CreateHoldFromByPartitionRequestFixture = createFixture<CreateHoldFromByPartitionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.partitionId.as(() => PartitionIdFixture.create().value);
  request.escrowId.as(() => HederaIdPropsFixture.create().value);
  request.sourceId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
});

export const ControllerCreateHoldByPartitionRequestFixture = createFixture<ControllerCreateHoldByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.escrowId.as(() => HederaIdPropsFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
  },
);

export const ProtectedCreateHoldByPartitionRequestFixture = createFixture<ProtectedCreateHoldByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.escrowId.as(() => HederaIdPropsFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
    request.deadline.faker((faker) => faker.date.future().getTime().toString());
    request.nonce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    request.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  },
);

export const GetHeldAmountForRequestFixture = createFixture<GetHeldAmountForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetHeldAmountForByPartitionRequestFixture = createFixture<GetHeldAmountForByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
  },
);

export const GetHoldCountForByPartitionRequestFixture = createFixture<GetHoldCountForByPartitionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.partitionId.as(() => PartitionIdFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetHoldsIdForByPartitionRequestFixture = createFixture<GetHoldsIdForByPartitionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.partitionId.as(() => PartitionIdFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetHoldForByPartitionRequestFixture = createFixture<GetHoldForByPartitionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.partitionId.as(() => PartitionIdFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.holdId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const ReleaseHoldByPartitionRequestFixture = createFixture<ReleaseHoldByPartitionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.partitionId.as(() => PartitionIdFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.holdId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
});

export const ReclaimHoldByPartitionRequestFixture = createFixture<ReclaimHoldByPartitionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.partitionId.as(() => PartitionIdFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.holdId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const ExecuteHoldByPartitionRequestFixture = createFixture<ExecuteHoldByPartitionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.sourceId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  request.partitionId.as(() => PartitionIdFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.holdId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const HoldDetailsFixture = createFixture<HoldDetails>((props) => {
  props.amount.faker((faker) => new BigDecimal(BigNumber.from(faker.number.int({ max: 999 })).toString()));
  props.expirationTimeStamp.faker((faker) => faker.date.future());
  props.escrowAddress.as(() => HederaIdPropsFixture.create().value);
  props.tokenHolderAddress.as(() => HederaIdPropsFixture.create().value);
  props.destinationAddress.as(() => HederaIdPropsFixture.create().value);
  props.data.faker((faker) => faker.lorem.words());
  props.operatorData.faker((faker) => faker.lorem.words());
});

export const GetHeldAmountForQueryFixture = createFixture<GetHeldAmountForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetHeldAmountForByPartitionQueryFixture = createFixture<GetHeldAmountForByPartitionQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.partitionId.as(() => PartitionIdFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetHoldCountForByPartitionQueryFixture = createFixture<GetHoldCountForByPartitionQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.partitionId.as(() => PartitionIdFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetHoldForByPartitionQueryFixture = createFixture<GetHoldForByPartitionQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.partitionId.as(() => PartitionIdFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.holdId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetHoldsIdForByPartitionQueryFixture = createFixture<GetHoldsIdForByPartitionQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.partitionId.as(() => PartitionIdFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const CreateHoldCommandFixture = createFixture<ProtectedCreateHoldByPartitionCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.partitionId.as(() => PartitionIdFixture.create().value);
  command.escrowId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.amount.faker((faker) => new BigDecimal(BigNumber.from(faker.number.int({ max: 999 })).toString()));
  command.sourceId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.expirationDate.faker((faker) => faker.date.future().getTime().toString());
  command.deadline.faker((faker) => faker.date.future().getTime().toString());
  command.nonce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  command.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
});

export const HandleHoldCommandFixture = createFixture<ExecuteHoldByPartitionCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.partitionId.as(() => PartitionIdFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.holdId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  command.amount.faker((faker) => new BigDecimal(BigNumber.from(faker.number.int({ max: 999 })).toString()));
});
