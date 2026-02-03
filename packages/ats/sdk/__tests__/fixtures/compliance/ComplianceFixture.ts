// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { SetComplianceCommand } from "@command/security/compliance/setCompliance/SetComplianceCommand";
import { ComplianceQuery } from "@query/security/compliance/compliance/ComplianceQuery";
import SetComplianceRequest from "@port/in/request/security/compliance/SetComplianceRequest";
import ComplianceRequest from "@port/in/request/security/compliance/ComplianceRequest";

export const SetComplianceCommandFixture = createFixture<SetComplianceCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.compliance.as(() => HederaIdPropsFixture.create().value);
});

export const ComplianceQueryFixture = createFixture<ComplianceQuery>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const SetComplianceRequestFixture = createFixture<SetComplianceRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.compliance.as(() => HederaIdPropsFixture.create().value);
});

export const ComplianceRequestFixture = createFixture<ComplianceRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});
