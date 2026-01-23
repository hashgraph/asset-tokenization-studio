// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  ApplyRolesRequest,
  GetRoleCountForRequest,
  GetRoleMemberCountRequest,
  GetRoleMembersRequest,
  GetRolesForRequest,
  RoleRequest,
} from "../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import {
  ApplyRolesRequestFixture,
  GetRoleCountForRequestFixture,
  GetRoleMemberCountRequestFixture,
  GetRoleMembersRequestFixture,
  GetRolesForRequestFixture,
  RoleRequestFixture,
} from "@test/fixtures/role/RoleFixture";
import Role from "./Role";
import { HasRoleQuery } from "@query/security/roles/hasRole/HasRoleQuery";
import { GrantRoleCommand } from "@command/security/roles/grantRole/GrantRoleCommand";
import { RevokeRoleCommand } from "@command/security/roles/revokeRole/RevokeRoleCommand";
import { GetRoleCountForQuery } from "@query/security/roles/getRoleCountFor/GetRoleCountForQuery";
import { GetRolesForQuery } from "@query/security/roles/getRolesFor/GetRolesForQuery";
import { GetRoleMemberCountQuery } from "@query/security/roles/getRoleMemberCount/GetRoleMemberCountQuery";
import { GetRoleMembersQuery } from "@query/security/roles/getRoleMembers/GetRoleMembersQuery";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import { ApplyRolesCommand } from "@command/security/roles/applyRoles/ApplyRolesCommand";
import { SecurityRole } from "@domain/context/security/SecurityRole";

describe("Role", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let roleRequest: RoleRequest;
  let getRoleCountForRequest: GetRoleCountForRequest;
  let getRolesForRequest: GetRolesForRequest;
  let getRoleMemberCountRequest: GetRoleMemberCountRequest;
  let getRoleMembersRequest: GetRoleMembersRequest;
  let applyRolesRequest: ApplyRolesRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;
  const account = new Account(AccountPropsFixture.create());

  const expectedResponse = {
    payload: true,
    transactionId: transactionId,
  };

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    mirrorNodeMock = createMock<MirrorNodeAdapter>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (Role as any).commandBus = commandBusMock;
    (Role as any).queryBus = queryBusMock;
    (Role as any).mirrorNode = mirrorNodeMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("hasRole", () => {
    roleRequest = new RoleRequest(RoleRequestFixture.create());

    const expectedResponse = {
      payload: true,
    };
    it("should get has role successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Role.hasRole(roleRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RoleRequest", roleRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new HasRoleQuery(roleRequest.role, roleRequest.targetId, roleRequest.securityId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Role.hasRole(roleRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("RoleRequest", roleRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new HasRoleQuery(roleRequest.role, roleRequest.targetId, roleRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      roleRequest = new RoleRequest({
        ...RoleRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Role.hasRole(roleRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      roleRequest = new RoleRequest({
        ...RoleRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Role.hasRole(roleRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if role is invalid", async () => {
      roleRequest = new RoleRequest({
        ...RoleRequestFixture.create({
          role: "invalid",
        }),
      });

      await expect(Role.hasRole(roleRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("grantRole", () => {
    it("should grant role successfully", async () => {
      roleRequest = new RoleRequest(RoleRequestFixture.create());
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Role.grantRole(roleRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RoleRequest", roleRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new GrantRoleCommand(roleRequest.role, roleRequest.targetId, roleRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      roleRequest = new RoleRequest(RoleRequestFixture.create());

      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Role.grantRole(roleRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("RoleRequest", roleRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new GrantRoleCommand(roleRequest.role, roleRequest.targetId, roleRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      roleRequest = new RoleRequest({
        ...RoleRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Role.grantRole(roleRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      roleRequest = new RoleRequest({
        ...RoleRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Role.grantRole(roleRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if role is invalid", async () => {
      roleRequest = new RoleRequest({
        ...RoleRequestFixture.create({
          role: "invalid",
        }),
      });

      await expect(Role.grantRole(roleRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("revokeRole", () => {
    it("should revoke role successfully", async () => {
      roleRequest = new RoleRequest(RoleRequestFixture.create());
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Role.revokeRole(roleRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RoleRequest", roleRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RevokeRoleCommand(roleRequest.role, roleRequest.targetId, roleRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      roleRequest = new RoleRequest(RoleRequestFixture.create());
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Role.revokeRole(roleRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("RoleRequest", roleRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RevokeRoleCommand(roleRequest.role, roleRequest.targetId, roleRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      roleRequest = new RoleRequest({
        ...RoleRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Role.revokeRole(roleRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      roleRequest = new RoleRequest({
        ...RoleRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Role.revokeRole(roleRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if role is invalid", async () => {
      roleRequest = new RoleRequest({
        ...RoleRequestFixture.create({
          role: "invalid",
        }),
      });

      await expect(Role.revokeRole(roleRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getRoleCountFor", () => {
    getRoleCountForRequest = new GetRoleCountForRequest(GetRoleCountForRequestFixture.create());

    const expectedResponse = {
      payload: 1,
    };
    it("should get role count for successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Role.getRoleCountFor(getRoleCountForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRoleCountForRequest", getRoleCountForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRoleCountForQuery(getRoleCountForRequest.targetId, getRoleCountForRequest.securityId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Role.getRoleCountFor(getRoleCountForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRoleCountForRequest", getRoleCountForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRoleCountForQuery(getRoleCountForRequest.targetId, getRoleCountForRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getRoleCountForRequest = new GetRoleCountForRequest({
        ...GetRoleCountForRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Role.getRoleCountFor(getRoleCountForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      getRoleCountForRequest = new GetRoleCountForRequest({
        ...GetRoleCountForRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Role.getRoleCountFor(getRoleCountForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getRolesFor", () => {
    getRolesForRequest = new GetRolesForRequest(GetRolesForRequestFixture.create());

    const expectedResponse = {
      payload: ["role"],
    };
    it("should get role for successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Role.getRolesFor(getRolesForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRolesForRequest", getRolesForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRolesForQuery(
          getRolesForRequest.targetId,
          getRolesForRequest.securityId,
          getRolesForRequest.start,
          getRolesForRequest.end,
        ),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Role.getRolesFor(getRolesForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRolesForRequest", getRolesForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRolesForQuery(
          getRolesForRequest.targetId,
          getRolesForRequest.securityId,
          getRolesForRequest.start,
          getRolesForRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getRolesForRequest = new GetRolesForRequest({
        ...GetRolesForRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Role.getRolesFor(getRolesForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      getRolesForRequest = new GetRolesForRequest({
        ...GetRolesForRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Role.getRolesFor(getRolesForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getRoleMemberCount", () => {
    getRoleMemberCountRequest = new GetRoleMemberCountRequest(GetRoleMemberCountRequestFixture.create());

    const expectedResponse = {
      payload: 1,
    };
    it("should get role member count successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Role.getRoleMemberCount(getRoleMemberCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRoleMemberCountRequest", getRoleMemberCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRoleMemberCountQuery(getRoleMemberCountRequest.role, getRoleMemberCountRequest.securityId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Role.getRoleMemberCount(getRoleMemberCountRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRoleMemberCountRequest", getRoleMemberCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRoleMemberCountQuery(getRoleMemberCountRequest.role, getRoleMemberCountRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getRoleMemberCountRequest = new GetRoleMemberCountRequest({
        ...GetRoleMemberCountRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Role.getRoleMemberCount(getRoleMemberCountRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if role is invalid", async () => {
      getRoleMemberCountRequest = new GetRoleMemberCountRequest({
        ...GetRoleMemberCountRequestFixture.create({
          role: "invalid",
        }),
      });

      await expect(Role.getRoleMemberCount(getRoleMemberCountRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getRoleMembers", () => {
    getRoleMembersRequest = new GetRoleMembersRequest(GetRoleMembersRequestFixture.create());

    const expectedResponse = {
      payload: [account.id.toString()],
    };
    it("should get role members successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);
      mirrorNodeMock.getAccountInfo.mockResolvedValue(account);

      const result = await Role.getRoleMembers(getRoleMembersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRoleMembersRequest", getRoleMembersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRoleMembersQuery(
          getRoleMembersRequest.role,
          getRoleMembersRequest.securityId,
          getRoleMembersRequest.start,
          getRoleMembersRequest.end,
        ),
      );
      expect(mirrorNodeMock.getAccountInfo).toHaveBeenCalledWith(account.id.toString());
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Role.getRoleMembers(getRoleMembersRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRoleMembersRequest", getRoleMembersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRoleMembersQuery(
          getRoleMembersRequest.role,
          getRoleMembersRequest.securityId,
          getRoleMembersRequest.start,
          getRoleMembersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getRoleMembersRequest = new GetRoleMembersRequest({
        ...GetRoleMembersRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Role.getRoleMembers(getRoleMembersRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if role is invalid", async () => {
      getRoleMembersRequest = new GetRoleMembersRequest({
        ...GetRoleMembersRequestFixture.create({
          role: "invalid",
        }),
      });

      await expect(Role.getRoleMembers(getRoleMembersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("applyRoles", () => {
    applyRolesRequest = new ApplyRolesRequest(ApplyRolesRequestFixture.create());

    it("should apply roles successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Role.applyRoles(applyRolesRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ApplyRolesRequest", applyRolesRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ApplyRolesCommand(
          applyRolesRequest.roles,
          applyRolesRequest.actives,
          applyRolesRequest.targetId,
          applyRolesRequest.securityId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Role.applyRoles(applyRolesRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ApplyRolesRequest", applyRolesRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ApplyRolesCommand(
          applyRolesRequest.roles,
          applyRolesRequest.actives,
          applyRolesRequest.targetId,
          applyRolesRequest.securityId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      applyRolesRequest = new ApplyRolesRequest({
        ...ApplyRolesRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Role.applyRoles(applyRolesRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      applyRolesRequest = new ApplyRolesRequest({
        ...ApplyRolesRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Role.applyRoles(applyRolesRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if roles is empty", async () => {
      applyRolesRequest = new ApplyRolesRequest({
        ...ApplyRolesRequestFixture.create({
          roles: [],
        }),
      });

      await expect(Role.applyRoles(applyRolesRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if roles not exist", async () => {
      applyRolesRequest = new ApplyRolesRequest({
        ...ApplyRolesRequestFixture.create({
          roles: ["invalid"],
        }),
      });

      await expect(Role.applyRoles(applyRolesRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if roles is duplicated", async () => {
      applyRolesRequest = new ApplyRolesRequest({
        ...ApplyRolesRequestFixture.create({
          roles: [SecurityRole._DEFAULT_ADMIN_ROLE, SecurityRole._DEFAULT_ADMIN_ROLE],
        }),
      });

      await expect(Role.applyRoles(applyRolesRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if roles list and active list are different", async () => {
      applyRolesRequest = new ApplyRolesRequest({
        ...ApplyRolesRequestFixture.create({
          roles: [SecurityRole._DEFAULT_ADMIN_ROLE],
          actives: [true, false],
        }),
      });

      await expect(Role.applyRoles(applyRolesRequest)).rejects.toThrow(ValidationError);
    });
  });
});
