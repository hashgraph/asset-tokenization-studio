// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  ActivateInternalKycRequest,
  DeactivateInternalKycRequest,
  GetKycAccountsCountRequest,
  GetKycAccountsDataRequest,
  GetKycForRequest,
  GetKycStatusForRequest,
  GrantKycRequest,
  IsInternalKycActivatedRequest,
  RevokeKycRequest,
} from "../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import {
  ActivateInternalKycRequestFixture,
  DeactivateInternalKycRequestFixture,
  GetKycAccountsCountRequestFixture,
  GetKycAccountsDataRequestFixture,
  GetKycForRequestFixture,
  GetKycStatusForRequestFixture,
  GrantKycRequestFixture,
  IsInternalKycActivatedQueryFixture,
  KycAccountDataFixture,
  KycFixture,
  RevokeKycRequestFixture,
} from "@test/fixtures/kyc/KycFixture";
import Kyc from "./Kyc";
import { ActivateInternalKycCommand } from "@command/security/kyc/activateInternalKyc/ActivateInternalKycCommand";
import { DeactivateInternalKycCommand } from "@command/security/kyc/deactivateInternalKyc/DeactivateInternalKycCommand";
import { IsInternalKycActivatedQuery } from "@query/security/kyc/isInternalKycActivated/IsInternalKycActivatedQuery";
import { GrantKycCommand } from "@command/security/kyc/grantKyc/GrantKycCommand";
import { RevokeKycCommand } from "@command/security/kyc/revokeKyc/RevokeKycCommand";
import { GetKycForQuery } from "@query/security/kyc/getKycFor/GetKycForQuery";
import { GetKycAccountsCountQuery } from "@query/security/kyc/getKycAccountsCount/GetKycAccountsCountQuery";
import { GetKycAccountsDataQuery } from "@query/security/kyc/getKycAccountsData/GetKycAccountsDataQuery";
import { GetKycStatusForQuery } from "@query/security/kyc/getKycStatusFor/GetKycStatusForQuery";
describe("Kyc", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;

  let grantKycRequest: GrantKycRequest;
  let revokeKycRequest: RevokeKycRequest;
  let getKycAccountsCountRequest: GetKycAccountsCountRequest;
  let getKycForRequest: GetKycForRequest;
  let getKycAccountsDataRequest: GetKycAccountsDataRequest;
  let getKycStatusForRequest: GetKycStatusForRequest;
  let activateInternalKycRequest: ActivateInternalKycRequest;
  let deactivateInternalKycRequest: DeactivateInternalKycRequest;
  let isInternalKycActivatedRequest: IsInternalKycActivatedRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;

  const expectedResponse = {
    payload: true,
    transactionId: transactionId,
  };

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (Kyc as any).commandBus = commandBusMock;
    (Kyc as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("grantKyc", () => {
    grantKycRequest = new GrantKycRequest(GrantKycRequestFixture.create());
    it("should grant kyc successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kyc.grantKyc(grantKycRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GrantKycRequest", grantKycRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new GrantKycCommand(grantKycRequest.securityId, grantKycRequest.targetId, grantKycRequest.vcBase64),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Kyc.grantKyc(grantKycRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GrantKycRequest", grantKycRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new GrantKycCommand(grantKycRequest.securityId, grantKycRequest.targetId, grantKycRequest.vcBase64),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      grantKycRequest = new GrantKycRequest({
        ...GrantKycRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Kyc.grantKyc(grantKycRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      grantKycRequest = new GrantKycRequest({
        ...GrantKycRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Kyc.grantKyc(grantKycRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if vcBase64 is invalid", async () => {
      grantKycRequest = new GrantKycRequest({
        ...GrantKycRequestFixture.create({
          vcBase64: "inv@lid",
        }),
      });

      await expect(Kyc.grantKyc(grantKycRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("revokeKyc", () => {
    revokeKycRequest = new RevokeKycRequest(RevokeKycRequestFixture.create());
    it("should revoke kyc successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kyc.revokeKyc(revokeKycRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("RevokeKycRequest", revokeKycRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RevokeKycCommand(revokeKycRequest.securityId, revokeKycRequest.targetId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Kyc.revokeKyc(revokeKycRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("RevokeKycRequest", revokeKycRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RevokeKycCommand(revokeKycRequest.securityId, revokeKycRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      revokeKycRequest = new RevokeKycRequest({
        ...RevokeKycRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Kyc.revokeKyc(revokeKycRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      revokeKycRequest = new RevokeKycRequest({
        ...RevokeKycRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Kyc.revokeKyc(revokeKycRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getKycFor", () => {
    getKycForRequest = new GetKycForRequest(GetKycForRequestFixture.create());

    const expectedResponse = {
      payload: KycFixture.create(),
    };
    it("should get kyc for successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kyc.getKycFor(getKycForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycForRequest", getKycForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycForQuery(getKycForRequest.securityId, getKycForRequest.targetId),
      );

      expect(result).toEqual(
        expect.objectContaining({
          validFrom: expectedResponse.payload.validFrom,
          validTo: expectedResponse.payload.validTo,
          vcId: expectedResponse.payload.vcId,
          issuer: expectedResponse.payload.issuer,
          status: expectedResponse.payload.status,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Kyc.getKycFor(getKycForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycForRequest", getKycForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycForQuery(getKycForRequest.securityId, getKycForRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getKycForRequest = new GetKycForRequest({
        ...GetKycForRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Kyc.getKycFor(getKycForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      getKycForRequest = new GetKycForRequest({
        ...GetKycForRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Kyc.getKycFor(getKycForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getKycAccountsCount", () => {
    getKycAccountsCountRequest = new GetKycAccountsCountRequest(GetKycAccountsCountRequestFixture.create());

    const expectedResponse = {
      payload: 1,
    };
    it("should get kyc accounts count successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kyc.getKycAccountsCount(getKycAccountsCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycAccountsCountRequest", getKycAccountsCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycAccountsCountQuery(getKycAccountsCountRequest.securityId, getKycAccountsCountRequest.kycStatus),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Kyc.getKycAccountsCount(getKycAccountsCountRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycAccountsCountRequest", getKycAccountsCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycAccountsCountQuery(getKycAccountsCountRequest.securityId, getKycAccountsCountRequest.kycStatus),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getKycAccountsCountRequest = new GetKycAccountsCountRequest({
        ...GetKycAccountsCountRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Kyc.getKycAccountsCount(getKycAccountsCountRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if kycStatus is invalid", async () => {
      getKycAccountsCountRequest = new GetKycAccountsCountRequest({
        ...GetKycAccountsCountRequestFixture.create({
          kycStatus: -1,
        }),
      });

      await expect(Kyc.getKycAccountsCount(getKycAccountsCountRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getKycAccountsData", () => {
    getKycAccountsDataRequest = new GetKycAccountsDataRequest(GetKycAccountsDataRequestFixture.create());

    const expectedResponse = {
      payload: [KycAccountDataFixture.create()],
    };
    it("should get kyc accounts data successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kyc.getKycAccountsData(getKycAccountsDataRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycAccountsData", getKycAccountsDataRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycAccountsDataQuery(
          getKycAccountsDataRequest.securityId,
          getKycAccountsDataRequest.kycStatus,
          getKycAccountsDataRequest.start,
          getKycAccountsDataRequest.end,
        ),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            account: expectedResponse.payload[0].account,
            validFrom: expectedResponse.payload[0].validFrom,
            validTo: expectedResponse.payload[0].validTo,
            vcId: expectedResponse.payload[0].vcId,
            issuer: expectedResponse.payload[0].issuer,
            status: expectedResponse.payload[0].status,
          },
        ]),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Kyc.getKycAccountsData(getKycAccountsDataRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycAccountsData", getKycAccountsDataRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycAccountsDataQuery(
          getKycAccountsDataRequest.securityId,
          getKycAccountsDataRequest.kycStatus,
          getKycAccountsDataRequest.start,
          getKycAccountsDataRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getKycAccountsDataRequest = new GetKycAccountsDataRequest({
        ...GetKycAccountsDataRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Kyc.getKycAccountsData(getKycAccountsDataRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if kycStatus is invalid", async () => {
      getKycAccountsDataRequest = new GetKycAccountsDataRequest({
        ...GetKycAccountsDataRequestFixture.create({
          kycStatus: -1,
        }),
      });

      await expect(Kyc.getKycAccountsData(getKycAccountsDataRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if start is invalid", async () => {
      getKycAccountsDataRequest = new GetKycAccountsDataRequest({
        ...GetKycAccountsDataRequestFixture.create({
          start: -1,
        }),
      });

      await expect(Kyc.getKycAccountsData(getKycAccountsDataRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if end is invalid", async () => {
      getKycAccountsDataRequest = new GetKycAccountsDataRequest({
        ...GetKycAccountsDataRequestFixture.create({
          end: -1,
        }),
      });

      await expect(Kyc.getKycAccountsData(getKycAccountsDataRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getKycStatusFor", () => {
    getKycStatusForRequest = new GetKycStatusForRequest(GetKycStatusForRequestFixture.create());

    const expectedResponse = {
      payload: 1,
    };
    it("should get kyc status for successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kyc.getKycStatusFor(getKycStatusForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycStatusForRequest", getKycStatusForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycStatusForQuery(getKycStatusForRequest.securityId, getKycStatusForRequest.targetId),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Kyc.getKycStatusFor(getKycStatusForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetKycStatusForRequest", getKycStatusForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetKycStatusForQuery(getKycStatusForRequest.securityId, getKycStatusForRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getKycStatusForRequest = new GetKycStatusForRequest({
        ...GetKycStatusForRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Kyc.getKycStatusFor(getKycStatusForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      getKycStatusForRequest = new GetKycStatusForRequest({
        ...GetKycStatusForRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Kyc.getKycStatusFor(getKycStatusForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("activateInternalKyc", () => {
    activateInternalKycRequest = new ActivateInternalKycRequest(ActivateInternalKycRequestFixture.create());
    it("should update activate internal kyc successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kyc.activateInternalKyc(activateInternalKycRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ActivateInternalKycRequest", activateInternalKycRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ActivateInternalKycCommand(activateInternalKycRequest.securityId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Kyc.activateInternalKyc(activateInternalKycRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ActivateInternalKycRequest", activateInternalKycRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ActivateInternalKycCommand(activateInternalKycRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      activateInternalKycRequest = new ActivateInternalKycRequest({
        ...ActivateInternalKycRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Kyc.activateInternalKyc(activateInternalKycRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("deactivateInternalKyc", () => {
    deactivateInternalKycRequest = new DeactivateInternalKycRequest(DeactivateInternalKycRequestFixture.create());
    it("should update deactivate internal kyc successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kyc.deactivateInternalKyc(deactivateInternalKycRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("DeactivateInternalKycRequest", deactivateInternalKycRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new DeactivateInternalKycCommand(deactivateInternalKycRequest.securityId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Kyc.deactivateInternalKyc(deactivateInternalKycRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("DeactivateInternalKycRequest", deactivateInternalKycRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new DeactivateInternalKycCommand(deactivateInternalKycRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      deactivateInternalKycRequest = new DeactivateInternalKycRequest({
        ...DeactivateInternalKycRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Kyc.activateInternalKyc(activateInternalKycRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("isInternalKycActivated", () => {
    isInternalKycActivatedRequest = new IsInternalKycActivatedRequest(IsInternalKycActivatedQueryFixture.create());
    const expectedQueryResponse = {
      payload: true,
    };

    it("should check if internal kyc is activated", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await Kyc.isInternalKycActivated(isInternalKycActivatedRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsInternalKycActivatedRequest", isInternalKycActivatedRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsInternalKycActivatedQuery(isInternalKycActivatedRequest.securityId),
      );

      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Kyc.isInternalKycActivated(isInternalKycActivatedRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("IsInternalKycActivatedRequest", isInternalKycActivatedRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsInternalKycActivatedQuery(isInternalKycActivatedRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isInternalKycActivatedRequest = new IsInternalKycActivatedRequest({
        ...IsInternalKycActivatedQueryFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Kyc.isInternalKycActivated(isInternalKycActivatedRequest)).rejects.toThrow(ValidationError);
    });
  });
});
