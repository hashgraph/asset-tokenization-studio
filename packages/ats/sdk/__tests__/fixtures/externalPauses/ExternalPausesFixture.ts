// SPDX-License-Identifier: Apache-2.0

import { AddExternalPauseCommand } from "@command/security/externalPauses/addExternalPause/AddExternalPauseCommand";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { createFixture } from "../config";
import { SetPausedMockCommand } from "@command/security/externalPauses/mock/setPaused/SetPausedMockCommand";
import { RemoveExternalPauseCommand } from "@command/security/externalPauses/removeExternalPause/RemoveExternalPauseCommand";
import { UpdateExternalPausesCommand } from "@command/security/externalPauses/updateExternalPauses/UpdateExternalPausesCommand";
import UpdateExternalPausesRequest from "@port/in/request/security/externalPauses/UpdateExternalPausesRequest";
import AddExternalPauseRequest from "@port/in/request/security/externalPauses/AddExternalPauseRequest";
import RemoveExternalPauseRequest from "@port/in/request/security/externalPauses/RemoveExternalPauseRequest";
import IsExternalPauseRequest from "@port/in/request/security/externalPauses/IsExternalPauseRequest";
import GetExternalPausesCountRequest from "@port/in/request/security/externalPauses/GetExternalPausesCountRequest";
import GetExternalPausesMembersRequest from "@port/in/request/security/externalPauses/GetExternalPausesMembersRequest";
import SetPausedMockRequest from "@port/in/request/security/externalPauses/mock/SetPausedMockRequest";
import IsPausedMockRequest from "@port/in/request/security/externalPauses/mock/IsPausedMockRequest";
import { GetExternalPausesCountQuery } from "@query/security/externalPauses/getExternalPausesCount/GetExternalPausesCountQuery";
import { GetExternalPausesMembersQuery } from "@query/security/externalPauses/getExternalPausesMembers/GetExternalPausesMembersQuery";
import { IsExternalPauseQuery } from "@query/security/externalPauses/isExternalPause/IsExternalPauseQuery";
import { IsPausedMockQuery } from "@query/security/externalPauses/mock/isPaused/IsPausedMockQuery";

export const AddExternalPauseCommandFixture = createFixture<AddExternalPauseCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.externalPauseAddress.as(() => HederaIdPropsFixture.create().value);
});

export const SetPausedMockCommandFixture = createFixture<SetPausedMockCommand>((command) => {
  command.contractId.as(() => HederaIdPropsFixture.create().value);
  command.paused.faker((faker) => faker.datatype.boolean());
});

export const RemoveExternalPauseCommandFixture = createFixture<RemoveExternalPauseCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.externalPauseAddress.as(() => HederaIdPropsFixture.create().value);
});

export const UpdateExternalPausesCommandFixture = createFixture<UpdateExternalPausesCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.externalPausesAddresses.as(() => [HederaIdPropsFixture.create().value]);
  command.actives.faker((faker) => [faker.datatype.boolean()]);
});

export const GetExternalPausesCountQueryFixture = createFixture<GetExternalPausesCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetExternalPausesMembersQueryFixture = createFixture<GetExternalPausesMembersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const IsExternalPauseQueryFixture = createFixture<IsExternalPauseQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.externalPauseAddress.as(() => HederaIdPropsFixture.create().value);
});

export const IsPausedMockQueryFixture = createFixture<IsPausedMockQuery>((query) => {
  query.contractId.as(() => HederaIdPropsFixture.create().value);
});

export const UpdateExternalPausesRequestFixture = createFixture<UpdateExternalPausesRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalPausesAddresses.as(() => [HederaIdPropsFixture.create().value]);
  request.actives.faker((faker) => [faker.datatype.boolean()]);
});

export const AddExternalPauseRequestFixture = createFixture<AddExternalPauseRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalPauseAddress.as(() => [HederaIdPropsFixture.create().value]);
});

export const RemoveExternalPauseRequestFixture = createFixture<RemoveExternalPauseRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalPauseAddress.as(() => [HederaIdPropsFixture.create().value]);
});

export const IsExternalPauseRequestFixture = createFixture<IsExternalPauseRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.externalPauseAddress.as(() => [HederaIdPropsFixture.create().value]);
});

export const GetExternalPausesCountRequestFixture = createFixture<GetExternalPausesCountRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetExternalPausesMembersRequestFixture = createFixture<GetExternalPausesMembersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const SetPausedMockRequestFixture = createFixture<SetPausedMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
  request.paused.faker((faker) => faker.datatype.boolean());
});

export const IsPausedMockRequestFixture = createFixture<IsPausedMockRequest>((request) => {
  request.contractId.as(() => HederaIdPropsFixture.create().value);
});
