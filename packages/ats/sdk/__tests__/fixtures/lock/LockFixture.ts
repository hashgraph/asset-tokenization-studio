// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaId } from "@domain/context/shared/HederaId";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { GetLockQuery } from "@query/security/getLock/GetLockQuery";
import { LockCountQuery } from "@query/security/lockCount/LockCountQuery";
import { LockedBalanceOfQuery } from "@query/security/lockedBalanceOf/LockedBalanceOfQuery";
import { LocksIdQuery } from "@query/security/locksId/LocksIdQuery";
import LockRequest from "@port/in/request/security/operations/lock/LockRequest";
import ReleaseRequest from "@port/in/request/security/operations/release/ReleaseRequest";
import GetLockedBalanceRequest from "@port/in/request/security/operations/lock/GetLockedBalanceRequest";
import GetLockCountRequest from "@port/in/request/security/operations/lock/GetLockCountRequest";
import GetLocksIdRequest from "@port/in/request/security/operations/lock/GetLocksIdRequest";
import GetLockRequest from "@port/in/request/security/operations/lock/GetLockRequest";
import { Lock } from "@domain/context/security/Lock";
import BigDecimal from "@domain/context/shared/BigDecimal";

import { LockCommand } from "@command/security/operations/lock/LockCommand";
import { ReleaseCommand } from "@command/security/operations/release/ReleaseCommand";

export const GetLockQueryFixture = createFixture<GetLockQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.id.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const LockCountQueryFixture = createFixture<LockCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const LockedBalanceOfQueryFixture = createFixture<LockedBalanceOfQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const LocksIdQueryFixture = createFixture<LocksIdQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const LockCommandFixture = createFixture<LockCommand>((command) => {
  command.amount.faker((faker) => faker.number.int({ min: 1, max: 1000 }).toString());
  command.sourceId.as(() => HederaIdPropsFixture.create().value);
  command.expirationDate.faker((faker) => faker.date.future().getTime().toString());
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const ReleaseCommandFixture = createFixture<ReleaseCommand>((command) => {
  command.lockId.faker((faker) => faker.number.int({ min: 1, max: 1000 }));
  command.sourceId.as(() => HederaIdPropsFixture.create().value);
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const LockRequestFixture = createFixture<LockRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  request.expirationTimestamp.faker((faker) => faker.date.future().getTime().toString());
});

export const ReleaseRequestFixture = createFixture<ReleaseRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.lockId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetLockedBalanceRequestFixture = createFixture<GetLockedBalanceRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetLockCountRequestFixture = createFixture<GetLockCountRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetLocksIdRequestFixture = createFixture<GetLocksIdRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.start.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  request.end.faker((faker) => faker.number.int({ min: 0, max: 1 }));
});

export const GetLockRequestFixture = createFixture<GetLockRequest>((request) => {
  request.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  request.id.faker((faker) => faker.number.int({ min: 0, max: 1 }));
});

export const LockFixture = createFixture<Lock>((props) => {
  props.id.as(() => new HederaId(HederaIdPropsFixture.create().value));
  props.amount.faker((faker) => new BigDecimal(BigInt(faker.number.int({ max: 999 })).toString()));
  props.expiredTimestamp.faker((faker) => BigInt(faker.date.future().getTime()));
});
