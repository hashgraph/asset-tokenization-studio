// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { GetIssuerListCountQuery } from "@query/security/ssi/getIssuerListCount/GetIssuerListCountQuery";
import { GetIssuerListMembersQuery } from "@query/security/ssi/getIssuerListMembers/GetIssuerListMembersQuery";
import { GetRevocationRegistryAddressQuery } from "@query/security/ssi/getRevocationRegistryAddress/GetRevocationRegistryAddressQuery";
import { IsIssuerQuery } from "@query/security/ssi/isIssuer/IsIssuerQuery";
import AddIssuerRequest from "@port/in/request/security/ssi/AddIssuerRequest";
import SetRevocationRegistryAddressRequest from "@port/in/request/security/ssi/SetRevocationRegistryAddressRequest";
import RemoveIssuerRequest from "@port/in/request/security/operations/issue/RemoveIssuerRequest";
import GetRevocationRegistryAddressRequest from "@port/in/request/security/ssi/GetRevocationRegistryAddressRequest";
import GetIssuerListCountRequest from "@port/in/request/security/ssi/GetIssuerListCountRequest";
import GetIssuerListMembersRequest from "@port/in/request/security/ssi/GetIssuerListMembersRequest";
import IsIssuerRequest from "@port/in/request/security/operations/issue/IsIssuerRequest";
import { AddIssuerCommand } from "@command/security/ssi/addIssuer/AddIssuerCommand";
import { SetRevocationRegistryAddressCommand } from "@command/security/ssi/setRevocationRegistryAddress/SetRevocationRegistryAddressCommand";

export const AddIssuerRequestFixture = createFixture<AddIssuerRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.issuerId.as(() => HederaIdPropsFixture.create().value);
});

export const GetIssuerListCountQueryFixture = createFixture<GetIssuerListCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetIssuerListMembersQueryFixture = createFixture<GetIssuerListMembersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetRevocationRegistryAddressQueryFixture = createFixture<GetRevocationRegistryAddressQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const IsIssuerQueryFixture = createFixture<IsIssuerQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.issuerId.as(() => HederaIdPropsFixture.create().value);
});

export const SetRevocationRegistryAddressRequestFixture = createFixture<SetRevocationRegistryAddressRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.revocationRegistryId.as(() => HederaIdPropsFixture.create().value);
  },
);

export const RemoveIssuerRequestFixture = createFixture<RemoveIssuerRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.issuerId.as(() => HederaIdPropsFixture.create().value);
});

export const GetRevocationRegistryAddressRequestFixture = createFixture<GetRevocationRegistryAddressRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
  },
);

export const GetIssuerListCountRequestFixture = createFixture<GetIssuerListCountRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetIssuerListMembersRequestFixture = createFixture<GetIssuerListMembersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const IsIssuerRequestFixture = createFixture<IsIssuerRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.issuerId.as(() => HederaIdPropsFixture.create().value);
});

export const AddIssuerCommandFixture = createFixture<AddIssuerCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.issuerId.as(() => HederaIdPropsFixture.create().value);
});

export const SetRevocationRegistryAddressCommandFixture = createFixture<SetRevocationRegistryAddressCommand>(
  (command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.revocationRegistryId.as(() => HederaIdPropsFixture.create().value);
  },
);
