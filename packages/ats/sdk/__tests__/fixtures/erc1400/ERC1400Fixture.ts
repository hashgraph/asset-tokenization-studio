// SPDX-License-Identifier: Apache-2.0

import GetSecurityDetailsRequest from "@port/in/request/security/GetSecurityDetailsRequest";
import { createFixture } from "../config";
import { HederaIdPropsFixture, PartitionIdFixture } from "../shared/DataFixture";
import { HederaId } from "@domain/context/shared/HederaId";
import { BalanceOfQuery } from "@query/security/balanceof/BalanceOfQuery";
import { CanRedeemByPartitionQuery } from "@query/security/canRedeemByPartition/CanRedeemByPartitionQuery";
import { CanTransferQuery } from "@query/security/canTransfer/CanTransferQuery";
import { CanTransferByPartitionQuery } from "@query/security/canTransferByPartition/CanTransferByPartitionQuery";
import { GetMaxSupplyQuery } from "@query/security/cap/getMaxSupply/GetMaxSupplyQuery";
import { GetMaxSupplyByPartitionQuery } from "@query/security/cap/getMaxSupplyByPartition/GetMaxSupplyByPartitionQuery";
import { GetTotalSupplyByPartitionQuery } from "@query/security/cap/getTotalSupplyByPartition/GetTotalSupplyByPartitionQuery";
import { IsOperatorQuery } from "@query/security/operator/isOperator/IsOperatorQuery";
import { IsOperatorForPartitionQuery } from "@query/security/operator/isOperatorForPartition/IsOperatorForPartitionQuery";
import GetAccountBalanceRequest from "@port/in/request/account/GetAccountBalanceRequest";
import SetMaxSupplyRequest from "@port/in/request/security/operations/cap/SetMaxSupplyRequest";
import GetMaxSupplyRequest from "@port/in/request/security/operations/cap/GetMaxSupplyRequest";

export const BalanceOfQueryFixture = createFixture<BalanceOfQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetSecurityDetailsRequestFixture = createFixture<GetSecurityDetailsRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetAccountBalanceRequestFixture = createFixture<GetAccountBalanceRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const SetMaxSupplyRequestFixture = createFixture<SetMaxSupplyRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.maxSupply.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
});

export const GetMaxSupplyRequestFixture = createFixture<GetMaxSupplyRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const CanRedeemByPartitionQueryFixture = createFixture<CanRedeemByPartitionQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.sourceId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.partitionId.as(() => PartitionIdFixture.create().value);
  query.amount.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const CanTransferQueryFixture = createFixture<CanTransferQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.amount.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const CanTransferByPartitionQueryFixture = createFixture<CanTransferByPartitionQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.sourceId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.partitionId.as(() => PartitionIdFixture.create().value);
  query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.amount.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetMaxSupplyQueryFixture = createFixture<GetMaxSupplyQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetMaxSupplyByPartitionQueryFixture = createFixture<GetMaxSupplyByPartitionQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.partitionId.as(() => PartitionIdFixture.create().value);
});

export const GetTotalSupplyByPartitionQueryFixture = createFixture<GetTotalSupplyByPartitionQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.partitionId.as(() => PartitionIdFixture.create().value);
});

export const IsOperatorQueryFixture = createFixture<IsOperatorQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.operatorId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const IsOperatorForPartitionQueryFixture = createFixture<IsOperatorForPartitionQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.operatorId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.partitionId.as(() => PartitionIdFixture.create().value);
});
