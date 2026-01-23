// SPDX-License-Identifier: Apache-2.0

import { GetRoleCountForQuery } from "@query/security/roles/getRoleCountFor/GetRoleCountForQuery";
import RoleRequest from "@port/in/request/security/roles/RoleRequest";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { GetRoleMemberCountQuery } from "@query/security/roles/getRoleMemberCount/GetRoleMemberCountQuery";
import { GetRoleMembersQuery } from "@query/security/roles/getRoleMembers/GetRoleMembersQuery";
import { GetRolesForQuery } from "@query/security/roles/getRolesFor/GetRolesForQuery";
import { HasRoleQuery } from "@query/security/roles/hasRole/HasRoleQuery";
import GetRoleCountForRequest from "@port/in/request/security/roles/GetRoleCountForRequest";
import GetRolesForRequest from "@port/in/request/security/roles/GetRolesForRequest";
import GetRoleMemberCountRequest from "@port/in/request/security/roles/GetRoleMemberCountRequest";
import GetRoleMembersRequest from "@port/in/request/security/roles/GetRoleMembersRequest";
import ApplyRolesRequest from "@port/in/request/security/roles/ApplyRolesRequest";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { ApplyRolesCommand } from "@command/security/roles/applyRoles/ApplyRolesCommand";
import { GrantRoleCommand } from "@command/security/roles/grantRole/GrantRoleCommand";

export const GetRoleCountForQueryFixture = createFixture<GetRoleCountForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetRoleMemberCountQueryFixture = createFixture<GetRoleMemberCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.role.faker((faker) => faker.lorem.words());
});

export const GetRoleMembersQueryFixture = createFixture<GetRoleMembersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.role.faker((faker) => faker.lorem.words());
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetRolesForQueryFixture = createFixture<GetRolesForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const HasRoleQueryFixture = createFixture<HasRoleQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.role.faker((faker) => faker.lorem.words());
});

export const RoleRequestFixture = createFixture<RoleRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.role.faker((faker) => faker.helpers.arrayElement(Object.values(SecurityRole)));
});

export const GetRoleCountForRequestFixture = createFixture<GetRoleCountForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetRolesForRequestFixture = createFixture<GetRolesForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetRoleMemberCountRequestFixture = createFixture<GetRoleMemberCountRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.role.faker((faker) => faker.helpers.arrayElement(Object.values(SecurityRole)));
});

export const GetRoleMembersRequestFixture = createFixture<GetRoleMembersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.role.faker((faker) => faker.helpers.arrayElement(Object.values(SecurityRole)));
  request.start.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const ApplyRolesRequestFixture = createFixture<ApplyRolesRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.roles.faker((faker) => [faker.helpers.arrayElement(Object.values(SecurityRole))]);
  request.actives.faker((faker) => [faker.datatype.boolean()]);
});

export const ApplyRolesCommandFixture = createFixture<ApplyRolesCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.roles.faker((faker) =>
    Array.from({ length: 3 }, () => faker.string.hexadecimal({ length: 64, prefix: "0x", casing: "lower" })),
  );
  command.actives.faker((faker) => Array.from({ length: 3 }, () => faker.datatype.boolean()));
});

export const GrantRoleCommandFixture = createFixture<GrantRoleCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.role.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x", casing: "lower" }));
});
