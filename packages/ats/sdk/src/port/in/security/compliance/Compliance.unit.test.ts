// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { ComplianceRequest, SetComplianceRequest } from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { ComplianceQueryFixture, SetComplianceCommandFixture } from "@test/fixtures/compliance/ComplianceFixture";
import { SetComplianceCommand } from "@command/security/compliance/setCompliance/SetComplianceCommand";
import { ComplianceQuery } from "@query/security/compliance/compliance/ComplianceQuery";

describe("Compliance", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let setComplianceRequest: SetComplianceRequest;
  let complianceRequest: ComplianceRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    mirrorNodeMock = createMock<MirrorNodeAdapter>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (Security as any).commandBus = commandBusMock;
    (Security as any).queryBus = queryBusMock;
    (Security as any).mirrorNode = mirrorNodeMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("SetCompliance", () => {
    setComplianceRequest = new SetComplianceRequest(SetComplianceCommandFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should set compliance successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.setCompliance(setComplianceRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetComplianceRequest", setComplianceRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetComplianceCommand(setComplianceRequest.securityId, setComplianceRequest.compliance),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.setCompliance(setComplianceRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetComplianceRequest", setComplianceRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetComplianceCommand(setComplianceRequest.securityId, setComplianceRequest.compliance),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setComplianceRequest = new SetComplianceRequest({
        ...SetComplianceCommandFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.setCompliance(setComplianceRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if compliance is invalid", async () => {
      setComplianceRequest = new SetComplianceRequest({
        ...SetComplianceCommandFixture.create({
          compliance: "invalid",
        }),
      });

      await expect(Security.setCompliance(setComplianceRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("Compliance", () => {
    complianceRequest = new ComplianceRequest(ComplianceQueryFixture.create());

    const expectedResponse = {
      payload: transactionId,
    };
    it("should get compliance successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.compliance(complianceRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ComplianceRequest", complianceRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new ComplianceQuery(complianceRequest.securityId));
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.compliance(complianceRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ComplianceRequest", complianceRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new ComplianceQuery(complianceRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      complianceRequest = new ComplianceRequest({
        ...ComplianceQueryFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.compliance(complianceRequest)).rejects.toThrow(ValidationError);
    });
  });
});
