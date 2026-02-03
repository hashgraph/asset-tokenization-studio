// SPDX-License-Identifier: Apache-2.0

import { HederaIdPropsFixture } from "../shared/DataFixture";
import { createFixture } from "../config";
import { AddAgentCommand } from "@command/security/operations/agent/addAgent/AddAgentCommand";
import { RemoveAgentCommand } from "@command/security/operations/agent/removeAgent/RemoveAgentCommand";
import AddAgentRequest from "@port/in/request/security/operations/agent/AddAgentRequest";
import RemoveAgentRequest from "@port/in/request/security/operations/agent/RemoveAgentRequest";

export const AddAgentCommandFixture = createFixture<AddAgentCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.agentId.as(() => HederaIdPropsFixture.create().value);
});

export const RemoveAgentCommandFixture = createFixture<RemoveAgentCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.agentId.as(() => HederaIdPropsFixture.create().value);
});

export const AddAgentRequestFixture = createFixture<AddAgentRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.agentId.as(() => HederaIdPropsFixture.create().value);
});
export const RemoveAgentRequestFixture = createFixture<RemoveAgentRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.agentId.as(() => HederaIdPropsFixture.create().value);
});
