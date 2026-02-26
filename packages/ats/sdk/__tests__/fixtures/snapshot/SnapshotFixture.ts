// SPDX-License-Identifier: Apache-2.0

import TakeSnapshotRequest from "@port/in/request/security/operations/snapshot/TakeSnapshotRequest";
import { TakeSnapshotCommand } from "@command/security/operations/snapshot/takeSnapshot/TakeSnapshotCommand";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { GetTokenHoldersAtSnapshotQuery } from "@query/security/snapshot/getTokenHoldersAtSnapshot/GetTokenHoldersAtSnapshotQuery";
import { GetTotalTokenHoldersAtSnapshotQuery } from "@query/security/snapshot/getTotalTokenHoldersAtSnapshot/GetTotalTokenHoldersAtSnapshotQuery";
import GetTokenHoldersAtSnapshotRequest from "@port/in/request/security/operations/snapshot/GetTokenHoldersAtSnapshotRequest";
import GetTotalTokenHoldersAtSnapshotRequest from "@port/in/request/security/operations/snapshot/GetTotalTokenHoldersAtSnapshotRequest";
import { BalancesOfAtSnapshotQueryFixture, BalancesOfAtSnapshotRequestFixture } from "./BalancesOfAtSnapshotFixture";

export const TakeSnapshotCommandFixture = createFixture<TakeSnapshotCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const TakeSnapshotRequestFixture = createFixture<TakeSnapshotRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetTokenHoldersAtSnapshotQueryFixture = createFixture<GetTokenHoldersAtSnapshotQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.snapshotId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalTokenHoldersAtSnapshotQueryFixture = createFixture<GetTotalTokenHoldersAtSnapshotQuery>(
  (query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.snapshotId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  },
);

export const GetTokenHoldersAtSnapshotRequestFixture = createFixture<GetTokenHoldersAtSnapshotRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.snapshotId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalTokenHoldersAtSnapshotRequestFixture = createFixture<GetTotalTokenHoldersAtSnapshotRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.snapshotId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  },
);

export { BalancesOfAtSnapshotQueryFixture, BalancesOfAtSnapshotRequestFixture };
