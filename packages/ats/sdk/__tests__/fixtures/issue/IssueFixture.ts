// SPDX-License-Identifier: Apache-2.0

import IssueRequest from "@port/in/request/security/operations/issue/IssueRequest";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { IssueCommand } from "@command/security/operations/issue/IssueCommand";

export const IssueCommandFixture = createFixture<IssueCommand>((command) => {
  command.amount.faker((faker) => faker.number.int({ min: 1, max: 1000 }).toString());
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const IssueRequestFixture = createFixture<IssueRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
});
