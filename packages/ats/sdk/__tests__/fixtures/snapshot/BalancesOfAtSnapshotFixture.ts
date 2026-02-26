// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { BalancesOfAtSnapshotQuery } from "@query/security/snapshot/balancesOfAtSnapshot/BalancesOfAtSnapshotQuery";
import BalancesOfAtSnapshotRequest from "@port/in/request/snapshots/BalancesOfAtSnapshotRequest";

export const BalancesOfAtSnapshotQueryFixture = createFixture<BalancesOfAtSnapshotQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.snapshotId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  query.pageIndex.faker((faker) => faker.number.int({ min: 0, max: 100 }));
  query.pageLength.faker((faker) => faker.number.int({ min: 1, max: 50 }));
});

export const BalancesOfAtSnapshotRequestFixture = createFixture<BalancesOfAtSnapshotRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.snapshotId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.pageIndex.faker((faker) => faker.number.int({ min: 0, max: 100 }));
  request.pageLength.faker((faker) => faker.number.int({ min: 1, max: 50 }));
});
