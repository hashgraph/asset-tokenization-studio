// SPDX-License-Identifier: Apache-2.0

import { HederaIdPropsFixture } from "../shared/DataFixture";
import { createFixture } from "../config";
import { PauseCommand } from "@command/security/operations/pause/PauseCommand";
import { IsPausedQuery } from "@query/security/isPaused/IsPausedQuery";
import PauseRequest from "@port/in/request/security/operations/pause/PauseRequest";

export const PauseRequestFixture = createFixture<PauseRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const IsPausedQueryFixture = createFixture<IsPausedQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const PauseCommandFixture = createFixture<PauseCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});
