// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  ControllerCreateHoldByPartitionRequest,
  CreateHoldByPartitionRequest,
  CreateHoldFromByPartitionRequest,
  ExecuteHoldByPartitionRequest,
  GetHeldAmountForByPartitionRequest,
  GetHeldAmountForRequest,
  GetHoldCountForByPartitionRequest,
  GetHoldForByPartitionRequest,
  GetHoldsIdForByPartitionRequest,
  ProtectedCreateHoldByPartitionRequest,
  ReclaimHoldByPartitionRequest,
  ReleaseHoldByPartitionRequest,
} from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import {
  ControllerCreateHoldByPartitionRequestFixture,
  CreateHoldByPartitionRequestFixture,
  CreateHoldFromByPartitionRequestFixture,
  ExecuteHoldByPartitionRequestFixture,
  GetHeldAmountForByPartitionRequestFixture,
  GetHeldAmountForRequestFixture,
  GetHoldCountForByPartitionRequestFixture,
  GetHoldForByPartitionRequestFixture,
  GetHoldsIdForByPartitionRequestFixture,
  HoldDetailsFixture,
  ProtectedCreateHoldByPartitionRequestFixture,
  ReclaimHoldByPartitionRequestFixture,
  ReleaseHoldByPartitionRequestFixture,
} from "@test/fixtures/hold/HoldFixture";
import { CreateHoldByPartitionCommand } from "@command/security/operations/hold/createHoldByPartition/CreateHoldByPartitionCommand";
import { CreateHoldFromByPartitionCommand } from "@command/security/operations/hold/createHoldFromByPartition/CreateHoldFromByPartitionCommand";
import { ControllerCreateHoldByPartitionCommand } from "@command/security/operations/hold/controllerCreateHoldByPartition/ControllerCreateHoldByPartitionCommand";
import { ProtectedCreateHoldByPartitionCommand } from "@command/security/operations/hold/protectedCreateHoldByPartition/ProtectedCreateHoldByPartitionCommand";
import { GetHeldAmountForQuery } from "@query/security/hold/getHeldAmountFor/GetHeldAmountForQuery";
import { GetHeldAmountForByPartitionQuery } from "@query/security/hold/getHeldAmountForByPartition/GetHeldAmountForByPartitionQuery";
import { GetHoldCountForByPartitionQuery } from "@query/security/hold/getHoldCountForByPartition/GetHoldCountForByPartitionQuery";
import { GetHoldsIdForByPartitionQuery } from "@query/security/hold/getHoldsIdForByPartition/GetHoldsIdForByPartitionQuery";
import { GetHoldForByPartitionQuery } from "@query/security/hold/getHoldForByPartition/GetHoldForByPartitionQuery";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import { ReleaseHoldByPartitionCommand } from "@command/security/operations/hold/releaseHoldByPartition/ReleaseHoldByPartitionCommand";
import { ReclaimHoldByPartitionCommand } from "@command/security/operations/hold/reclaimHoldByPartition/ReclaimHoldByPartitionCommand";
import { ExecuteHoldByPartitionCommand } from "@command/security/operations/hold/executeHoldByPartition/ExecuteHoldByPartitionCommand";

describe("Hold", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let createHoldByPartitionRequest: CreateHoldByPartitionRequest;
  let createHoldFromByPartitionRequest: CreateHoldFromByPartitionRequest;
  let controllerCreateHoldByPartitionRequest: ControllerCreateHoldByPartitionRequest;
  let protectedCreateHoldByPartitionRequest: ProtectedCreateHoldByPartitionRequest;
  let getHeldAmountForRequest: GetHeldAmountForRequest;
  let getHeldAmountForByPartitionRequest: GetHeldAmountForByPartitionRequest;
  let getHoldCountForByPartitionRequest: GetHoldCountForByPartitionRequest;
  let getHoldsIdForByPartitionRequest: GetHoldsIdForByPartitionRequest;
  let getHoldForByPartitionRequest: GetHoldForByPartitionRequest;
  let releaseHoldByPartitionRequest: ReleaseHoldByPartitionRequest;
  let reclaimHoldByPartitionRequest: ReclaimHoldByPartitionRequest;
  let executeHoldByPartitionRequest: ExecuteHoldByPartitionRequest;

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

  describe("createHoldByPartition", () => {
    createHoldByPartitionRequest = new CreateHoldByPartitionRequest(CreateHoldByPartitionRequestFixture.create());

    const expectedResponse = {
      payload: 1,
      transactionId: transactionId,
    };
    it("should create hold by partition successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.createHoldByPartition(createHoldByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("CreateHoldByPartitionRequest", createHoldByPartitionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateHoldByPartitionCommand(
          createHoldByPartitionRequest.securityId,
          createHoldByPartitionRequest.partitionId,
          createHoldByPartitionRequest.escrowId,
          createHoldByPartitionRequest.amount,
          createHoldByPartitionRequest.targetId,
          createHoldByPartitionRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.createHoldByPartition(createHoldByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("CreateHoldByPartitionRequest", createHoldByPartitionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateHoldByPartitionCommand(
          createHoldByPartitionRequest.securityId,
          createHoldByPartitionRequest.partitionId,
          createHoldByPartitionRequest.escrowId,
          createHoldByPartitionRequest.amount,
          createHoldByPartitionRequest.targetId,
          createHoldByPartitionRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      createHoldByPartitionRequest = new CreateHoldByPartitionRequest({
        ...CreateHoldByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.createHoldByPartition(createHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      createHoldByPartitionRequest = new CreateHoldByPartitionRequest({
        ...CreateHoldByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.createHoldByPartition(createHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      createHoldByPartitionRequest = new CreateHoldByPartitionRequest({
        ...CreateHoldByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.createHoldByPartition(createHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if escrowId is invalid", async () => {
      createHoldByPartitionRequest = new CreateHoldByPartitionRequest({
        ...CreateHoldByPartitionRequestFixture.create({
          escrowId: "invalid",
        }),
      });

      await expect(Security.createHoldByPartition(createHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if expirationDate is invalid", async () => {
      createHoldByPartitionRequest = new CreateHoldByPartitionRequest({
        ...CreateHoldByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.createHoldByPartition(createHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("createHoldFromByPartition", () => {
    createHoldFromByPartitionRequest = new CreateHoldFromByPartitionRequest(
      CreateHoldFromByPartitionRequestFixture.create(),
    );

    const expectedResponse = {
      payload: 1,
      transactionId: transactionId,
    };
    it("should create hold from by partition successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.createHoldFromByPartition(createHoldFromByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "CreateHoldFromByPartitionRequest",
        createHoldFromByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateHoldFromByPartitionCommand(
          createHoldFromByPartitionRequest.securityId,
          createHoldFromByPartitionRequest.partitionId,
          createHoldFromByPartitionRequest.escrowId,
          createHoldFromByPartitionRequest.amount,
          createHoldFromByPartitionRequest.sourceId,
          createHoldFromByPartitionRequest.targetId,
          createHoldFromByPartitionRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.createHoldFromByPartition(createHoldFromByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "CreateHoldFromByPartitionRequest",
        createHoldFromByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateHoldFromByPartitionCommand(
          createHoldFromByPartitionRequest.securityId,
          createHoldFromByPartitionRequest.partitionId,
          createHoldFromByPartitionRequest.escrowId,
          createHoldFromByPartitionRequest.amount,
          createHoldFromByPartitionRequest.sourceId,
          createHoldFromByPartitionRequest.targetId,
          createHoldFromByPartitionRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      createHoldFromByPartitionRequest = new CreateHoldFromByPartitionRequest({
        ...CreateHoldFromByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.createHoldFromByPartition(createHoldFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if partitionId is invalid", async () => {
      createHoldFromByPartitionRequest = new CreateHoldFromByPartitionRequest({
        ...CreateHoldFromByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.createHoldFromByPartition(createHoldFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if amount is invalid", async () => {
      createHoldFromByPartitionRequest = new CreateHoldFromByPartitionRequest({
        ...CreateHoldFromByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.createHoldFromByPartition(createHoldFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if escrowId is invalid", async () => {
      createHoldFromByPartitionRequest = new CreateHoldFromByPartitionRequest({
        ...CreateHoldFromByPartitionRequestFixture.create({
          escrowId: "invalid",
        }),
      });

      await expect(Security.createHoldFromByPartition(createHoldFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if sourceId is invalid", async () => {
      createHoldFromByPartitionRequest = new CreateHoldFromByPartitionRequest({
        ...CreateHoldFromByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.createHoldFromByPartition(createHoldFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if expirationDate is invalid", async () => {
      createHoldFromByPartitionRequest = new CreateHoldFromByPartitionRequest({
        ...CreateHoldFromByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.createHoldFromByPartition(createHoldFromByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("controllerCreateHoldByPartition", () => {
    controllerCreateHoldByPartitionRequest = new ControllerCreateHoldByPartitionRequest(
      ControllerCreateHoldByPartitionRequestFixture.create(),
    );

    const expectedResponse = {
      payload: 1,
      transactionId: transactionId,
    };
    it("should controller create hold by partition successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.controllerCreateHoldByPartition(controllerCreateHoldByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ControllerCreateHoldByPartitionRequest",
        controllerCreateHoldByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ControllerCreateHoldByPartitionCommand(
          controllerCreateHoldByPartitionRequest.securityId,
          controllerCreateHoldByPartitionRequest.partitionId,
          controllerCreateHoldByPartitionRequest.escrowId,
          controllerCreateHoldByPartitionRequest.amount,
          controllerCreateHoldByPartitionRequest.sourceId,
          controllerCreateHoldByPartitionRequest.targetId,
          controllerCreateHoldByPartitionRequest.expirationDate,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.controllerCreateHoldByPartition(controllerCreateHoldByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ControllerCreateHoldByPartitionRequest",
        controllerCreateHoldByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ControllerCreateHoldByPartitionCommand(
          controllerCreateHoldByPartitionRequest.securityId,
          controllerCreateHoldByPartitionRequest.partitionId,
          controllerCreateHoldByPartitionRequest.escrowId,
          controllerCreateHoldByPartitionRequest.amount,
          controllerCreateHoldByPartitionRequest.sourceId,
          controllerCreateHoldByPartitionRequest.targetId,
          controllerCreateHoldByPartitionRequest.expirationDate,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      controllerCreateHoldByPartitionRequest = new ControllerCreateHoldByPartitionRequest({
        ...ControllerCreateHoldByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.controllerCreateHoldByPartition(controllerCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if partitionId is invalid", async () => {
      controllerCreateHoldByPartitionRequest = new ControllerCreateHoldByPartitionRequest({
        ...ControllerCreateHoldByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.controllerCreateHoldByPartition(controllerCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if amount is invalid", async () => {
      controllerCreateHoldByPartitionRequest = new ControllerCreateHoldByPartitionRequest({
        ...ControllerCreateHoldByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.controllerCreateHoldByPartition(controllerCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if escrowId is invalid", async () => {
      controllerCreateHoldByPartitionRequest = new ControllerCreateHoldByPartitionRequest({
        ...ControllerCreateHoldByPartitionRequestFixture.create({
          escrowId: "invalid",
        }),
      });

      await expect(Security.controllerCreateHoldByPartition(controllerCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if sourceId is invalid", async () => {
      controllerCreateHoldByPartitionRequest = new ControllerCreateHoldByPartitionRequest({
        ...ControllerCreateHoldByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.controllerCreateHoldByPartition(controllerCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if expirationDate is invalid", async () => {
      controllerCreateHoldByPartitionRequest = new ControllerCreateHoldByPartitionRequest({
        ...ControllerCreateHoldByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.controllerCreateHoldByPartition(controllerCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("protectedCreateHoldByPartition", () => {
    protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest(
      ProtectedCreateHoldByPartitionRequestFixture.create(),
    );

    const expectedResponse = {
      payload: 1,
      transactionId: transactionId,
    };
    it("should protected create hold by partition successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedCreateHoldByPartitionRequest",
        protectedCreateHoldByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedCreateHoldByPartitionCommand(
          protectedCreateHoldByPartitionRequest.securityId,
          protectedCreateHoldByPartitionRequest.partitionId,
          protectedCreateHoldByPartitionRequest.escrowId,
          protectedCreateHoldByPartitionRequest.amount,
          protectedCreateHoldByPartitionRequest.sourceId,
          protectedCreateHoldByPartitionRequest.targetId,
          protectedCreateHoldByPartitionRequest.expirationDate,
          protectedCreateHoldByPartitionRequest.deadline,
          protectedCreateHoldByPartitionRequest.nonce,
          protectedCreateHoldByPartitionRequest.signature,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ProtectedCreateHoldByPartitionRequest",
        protectedCreateHoldByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ProtectedCreateHoldByPartitionCommand(
          protectedCreateHoldByPartitionRequest.securityId,
          protectedCreateHoldByPartitionRequest.partitionId,
          protectedCreateHoldByPartitionRequest.escrowId,
          protectedCreateHoldByPartitionRequest.amount,
          protectedCreateHoldByPartitionRequest.sourceId,
          protectedCreateHoldByPartitionRequest.targetId,
          protectedCreateHoldByPartitionRequest.expirationDate,
          protectedCreateHoldByPartitionRequest.deadline,
          protectedCreateHoldByPartitionRequest.nonce,
          protectedCreateHoldByPartitionRequest.signature,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest({
        ...ProtectedCreateHoldByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if partitionId is invalid", async () => {
      protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest({
        ...ProtectedCreateHoldByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if amount is invalid", async () => {
      protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest({
        ...ProtectedCreateHoldByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if escrowId is invalid", async () => {
      protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest({
        ...ProtectedCreateHoldByPartitionRequestFixture.create({
          escrowId: "invalid",
        }),
      });

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if sourceId is invalid", async () => {
      protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest({
        ...ProtectedCreateHoldByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if targetId is invalid", async () => {
      protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest({
        ...ProtectedCreateHoldByPartitionRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if nonce is invalid", async () => {
      protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest({
        ...ProtectedCreateHoldByPartitionRequestFixture.create({
          nonce: -1,
        }),
      });

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if expirationDate is invalid", async () => {
      protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest({
        ...ProtectedCreateHoldByPartitionRequestFixture.create({
          expirationDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if deadline is invalid", async () => {
      protectedCreateHoldByPartitionRequest = new ProtectedCreateHoldByPartitionRequest({
        ...ProtectedCreateHoldByPartitionRequestFixture.create({
          deadline: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
        }),
      });

      await expect(Security.protectedCreateHoldByPartition(protectedCreateHoldByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getHeldAmountFor", () => {
    getHeldAmountForRequest = new GetHeldAmountForRequest(GetHeldAmountForRequestFixture.create());

    const expectedResponse = {
      payload: 1,
    };
    it("should get held amount for successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getHeldAmountFor(getHeldAmountForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetHeldAmountForRequest", getHeldAmountForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHeldAmountForQuery(getHeldAmountForRequest.securityId, getHeldAmountForRequest.targetId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getHeldAmountFor(getHeldAmountForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetHeldAmountForRequest", getHeldAmountForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHeldAmountForQuery(getHeldAmountForRequest.securityId, getHeldAmountForRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getHeldAmountForRequest = new GetHeldAmountForRequest({
        ...GetHeldAmountForRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getHeldAmountFor(getHeldAmountForRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      getHeldAmountForRequest = new GetHeldAmountForRequest({
        ...GetHeldAmountForRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getHeldAmountFor(getHeldAmountForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getHeldAmountForByPartition", () => {
    getHeldAmountForByPartitionRequest = new GetHeldAmountForByPartitionRequest(
      GetHeldAmountForByPartitionRequestFixture.create(),
    );

    const expectedResponse = {
      payload: 1,
    };
    it("should get held amount for by partition successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getHeldAmountForByPartition(getHeldAmountForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetHeldAmountForByPartitionRequest",
        getHeldAmountForByPartitionRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHeldAmountForByPartitionQuery(
          getHeldAmountForByPartitionRequest.securityId,
          getHeldAmountForByPartitionRequest.partitionId,
          getHeldAmountForByPartitionRequest.targetId,
        ),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getHeldAmountForByPartition(getHeldAmountForByPartitionRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetHeldAmountForByPartitionRequest",
        getHeldAmountForByPartitionRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHeldAmountForByPartitionQuery(
          getHeldAmountForByPartitionRequest.securityId,
          getHeldAmountForByPartitionRequest.partitionId,
          getHeldAmountForByPartitionRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getHeldAmountForByPartitionRequest = new GetHeldAmountForByPartitionRequest({
        ...GetHeldAmountForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getHeldAmountForByPartition(getHeldAmountForByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if targetId is invalid", async () => {
      getHeldAmountForByPartitionRequest = new GetHeldAmountForByPartitionRequest({
        ...GetHeldAmountForByPartitionRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getHeldAmountForByPartition(getHeldAmountForByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if partitionId is invalid", async () => {
      getHeldAmountForByPartitionRequest = new GetHeldAmountForByPartitionRequest({
        ...GetHeldAmountForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getHeldAmountForByPartition(getHeldAmountForByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getHoldCountForByPartition", () => {
    getHoldCountForByPartitionRequest = new GetHoldCountForByPartitionRequest(
      GetHoldCountForByPartitionRequestFixture.create(),
    );

    const expectedResponse = {
      payload: 1,
    };
    it("should get hold count for by partition successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getHoldCountForByPartition(getHoldCountForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetHoldCountForByPartitionRequest",
        getHoldCountForByPartitionRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHoldCountForByPartitionQuery(
          getHoldCountForByPartitionRequest.securityId,
          getHoldCountForByPartitionRequest.partitionId,
          getHoldCountForByPartitionRequest.targetId,
        ),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getHoldCountForByPartition(getHoldCountForByPartitionRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetHoldCountForByPartitionRequest",
        getHoldCountForByPartitionRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHoldCountForByPartitionQuery(
          getHoldCountForByPartitionRequest.securityId,
          getHoldCountForByPartitionRequest.partitionId,
          getHoldCountForByPartitionRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getHoldCountForByPartitionRequest = new GetHoldCountForByPartitionRequest({
        ...GetHoldCountForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getHoldCountForByPartition(getHoldCountForByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if targetId is invalid", async () => {
      getHoldCountForByPartitionRequest = new GetHoldCountForByPartitionRequest({
        ...GetHoldCountForByPartitionRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getHoldCountForByPartition(getHoldCountForByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if partitionId is invalid", async () => {
      getHoldCountForByPartitionRequest = new GetHoldCountForByPartitionRequest({
        ...GetHoldCountForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getHoldCountForByPartition(getHoldCountForByPartitionRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getHoldsIdForByPartition", () => {
    getHoldsIdForByPartitionRequest = new GetHoldsIdForByPartitionRequest(
      GetHoldsIdForByPartitionRequestFixture.create(),
    );

    const expectedResponse = {
      payload: [1],
    };
    it("should get holds id for by partition successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getHoldsIdForByPartition(getHoldsIdForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetHoldsIdForByPartitionRequest",
        getHoldsIdForByPartitionRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHoldsIdForByPartitionQuery(
          getHoldsIdForByPartitionRequest.securityId,
          getHoldsIdForByPartitionRequest.partitionId,
          getHoldsIdForByPartitionRequest.targetId,
          getHoldsIdForByPartitionRequest.start,
          getHoldsIdForByPartitionRequest.end,
        ),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getHoldsIdForByPartition(getHoldsIdForByPartitionRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetHoldsIdForByPartitionRequest",
        getHoldsIdForByPartitionRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHoldsIdForByPartitionQuery(
          getHoldsIdForByPartitionRequest.securityId,
          getHoldsIdForByPartitionRequest.partitionId,
          getHoldsIdForByPartitionRequest.targetId,
          getHoldsIdForByPartitionRequest.start,
          getHoldsIdForByPartitionRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getHoldsIdForByPartitionRequest = new GetHoldsIdForByPartitionRequest({
        ...GetHoldsIdForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getHoldsIdForByPartition(getHoldsIdForByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      getHoldsIdForByPartitionRequest = new GetHoldsIdForByPartitionRequest({
        ...GetHoldsIdForByPartitionRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getHoldsIdForByPartition(getHoldsIdForByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if partitionId is invalid", async () => {
      getHoldsIdForByPartitionRequest = new GetHoldsIdForByPartitionRequest({
        ...GetHoldsIdForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getHoldsIdForByPartition(getHoldsIdForByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if start is invalid", async () => {
      getHoldsIdForByPartitionRequest = new GetHoldsIdForByPartitionRequest({
        ...GetHoldsIdForByPartitionRequestFixture.create({
          start: -1,
        }),
      });

      await expect(Security.getHoldsIdForByPartition(getHoldsIdForByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if end is invalid", async () => {
      getHoldsIdForByPartitionRequest = new GetHoldsIdForByPartitionRequest({
        ...GetHoldsIdForByPartitionRequestFixture.create({
          end: -1,
        }),
      });

      await expect(Security.getHoldsIdForByPartition(getHoldsIdForByPartitionRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getHoldForByPartition", () => {
    getHoldForByPartitionRequest = new GetHoldForByPartitionRequest(GetHoldForByPartitionRequestFixture.create());

    const expectedResponse = {
      payload: HoldDetailsFixture.create(),
    };
    it("should get hold for by partition successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getHoldForByPartition(getHoldForByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetHoldForByPartitionRequest", getHoldForByPartitionRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHoldForByPartitionQuery(
          getHoldForByPartitionRequest.securityId,
          getHoldForByPartitionRequest.partitionId,
          getHoldForByPartitionRequest.targetId,
          getHoldForByPartitionRequest.holdId,
        ),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: getHoldForByPartitionRequest.holdId,
          amount: expectedResponse.payload.amount.toString(),
          expirationDate: new Date(expectedResponse.payload.expirationTimeStamp * ONE_THOUSAND),
          tokenHolderAddress: expectedResponse.payload.tokenHolderAddress,
          escrowAddress: expectedResponse.payload.escrowAddress,
          destinationAddress: expectedResponse.payload.destinationAddress,
          data: expectedResponse.payload.data,
          operatorData: expectedResponse.payload.operatorData,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getHoldForByPartition(getHoldForByPartitionRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("GetHoldForByPartitionRequest", getHoldForByPartitionRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHoldForByPartitionQuery(
          getHoldForByPartitionRequest.securityId,
          getHoldForByPartitionRequest.partitionId,
          getHoldForByPartitionRequest.targetId,
          getHoldForByPartitionRequest.holdId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getHoldForByPartitionRequest = new GetHoldForByPartitionRequest({
        ...GetHoldForByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getHoldForByPartition(getHoldForByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      getHoldForByPartitionRequest = new GetHoldForByPartitionRequest({
        ...GetHoldForByPartitionRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getHoldForByPartition(getHoldForByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if partitionId is invalid", async () => {
      getHoldForByPartitionRequest = new GetHoldForByPartitionRequest({
        ...GetHoldForByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.getHoldForByPartition(getHoldForByPartitionRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("releaseHoldByPartition", () => {
    releaseHoldByPartitionRequest = new ReleaseHoldByPartitionRequest(ReleaseHoldByPartitionRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should release hold by partition successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.releaseHoldByPartition(releaseHoldByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ReleaseHoldByPartitionRequest", releaseHoldByPartitionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ReleaseHoldByPartitionCommand(
          releaseHoldByPartitionRequest.securityId,
          releaseHoldByPartitionRequest.partitionId,
          releaseHoldByPartitionRequest.amount,
          releaseHoldByPartitionRequest.holdId,
          releaseHoldByPartitionRequest.targetId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.releaseHoldByPartition(releaseHoldByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("ReleaseHoldByPartitionRequest", releaseHoldByPartitionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ReleaseHoldByPartitionCommand(
          releaseHoldByPartitionRequest.securityId,
          releaseHoldByPartitionRequest.partitionId,
          releaseHoldByPartitionRequest.amount,
          releaseHoldByPartitionRequest.holdId,
          releaseHoldByPartitionRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      releaseHoldByPartitionRequest = new ReleaseHoldByPartitionRequest({
        ...ReleaseHoldByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.releaseHoldByPartition(releaseHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      releaseHoldByPartitionRequest = new ReleaseHoldByPartitionRequest({
        ...ReleaseHoldByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.releaseHoldByPartition(releaseHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      releaseHoldByPartitionRequest = new ReleaseHoldByPartitionRequest({
        ...ReleaseHoldByPartitionRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.releaseHoldByPartition(releaseHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      releaseHoldByPartitionRequest = new ReleaseHoldByPartitionRequest({
        ...ReleaseHoldByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.releaseHoldByPartition(releaseHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if holdId is invalid", async () => {
      releaseHoldByPartitionRequest = new ReleaseHoldByPartitionRequest({
        ...ReleaseHoldByPartitionRequestFixture.create({
          holdId: -1,
        }),
      });

      await expect(Security.releaseHoldByPartition(releaseHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("reclaimHoldByPartition", () => {
    reclaimHoldByPartitionRequest = new ReclaimHoldByPartitionRequest(ReclaimHoldByPartitionRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should reclaim hold by partition successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.reclaimHoldByPartition(reclaimHoldByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ReclaimHoldByPartitionRequest", reclaimHoldByPartitionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ReclaimHoldByPartitionCommand(
          reclaimHoldByPartitionRequest.securityId,
          reclaimHoldByPartitionRequest.partitionId,
          reclaimHoldByPartitionRequest.holdId,
          reclaimHoldByPartitionRequest.targetId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.reclaimHoldByPartition(reclaimHoldByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("ReclaimHoldByPartitionRequest", reclaimHoldByPartitionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ReclaimHoldByPartitionCommand(
          reclaimHoldByPartitionRequest.securityId,
          reclaimHoldByPartitionRequest.partitionId,
          reclaimHoldByPartitionRequest.holdId,
          reclaimHoldByPartitionRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      reclaimHoldByPartitionRequest = new ReclaimHoldByPartitionRequest({
        ...ReclaimHoldByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.reclaimHoldByPartition(reclaimHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if partitionId is invalid", async () => {
      reclaimHoldByPartitionRequest = new ReclaimHoldByPartitionRequest({
        ...ReclaimHoldByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.reclaimHoldByPartition(reclaimHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      reclaimHoldByPartitionRequest = new ReclaimHoldByPartitionRequest({
        ...ReclaimHoldByPartitionRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.reclaimHoldByPartition(reclaimHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if holdId is invalid", async () => {
      reclaimHoldByPartitionRequest = new ReclaimHoldByPartitionRequest({
        ...ReclaimHoldByPartitionRequestFixture.create({
          holdId: -1,
        }),
      });

      await expect(Security.reclaimHoldByPartition(reclaimHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("executeHoldByPartition", () => {
    executeHoldByPartitionRequest = new ExecuteHoldByPartitionRequest(ExecuteHoldByPartitionRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should execute hold by partition successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.executeHoldByPartition(executeHoldByPartitionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ExecuteHoldByPartitionRequest", executeHoldByPartitionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ExecuteHoldByPartitionCommand(
          executeHoldByPartitionRequest.securityId,
          executeHoldByPartitionRequest.sourceId,
          executeHoldByPartitionRequest.amount,
          executeHoldByPartitionRequest.holdId,
          executeHoldByPartitionRequest.targetId,
          executeHoldByPartitionRequest.partitionId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.executeHoldByPartition(executeHoldByPartitionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("ExecuteHoldByPartitionRequest", executeHoldByPartitionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ExecuteHoldByPartitionCommand(
          executeHoldByPartitionRequest.securityId,
          executeHoldByPartitionRequest.sourceId,
          executeHoldByPartitionRequest.amount,
          executeHoldByPartitionRequest.holdId,
          executeHoldByPartitionRequest.targetId,
          executeHoldByPartitionRequest.partitionId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      executeHoldByPartitionRequest = new ExecuteHoldByPartitionRequest({
        ...ExecuteHoldByPartitionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.executeHoldByPartition(executeHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if sourceId is invalid", async () => {
      executeHoldByPartitionRequest = new ExecuteHoldByPartitionRequest({
        ...ExecuteHoldByPartitionRequestFixture.create({
          sourceId: "invalid",
        }),
      });

      await expect(Security.executeHoldByPartition(executeHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      executeHoldByPartitionRequest = new ExecuteHoldByPartitionRequest({
        ...ExecuteHoldByPartitionRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.executeHoldByPartition(executeHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if holdId is invalid", async () => {
      executeHoldByPartitionRequest = new ExecuteHoldByPartitionRequest({
        ...ExecuteHoldByPartitionRequestFixture.create({
          holdId: -1,
        }),
      });

      await expect(Security.executeHoldByPartition(executeHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      executeHoldByPartitionRequest = new ExecuteHoldByPartitionRequest({
        ...ExecuteHoldByPartitionRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.executeHoldByPartition(executeHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if partitionId is invalid", async () => {
      executeHoldByPartitionRequest = new ExecuteHoldByPartitionRequest({
        ...ExecuteHoldByPartitionRequestFixture.create({
          partitionId: "invalid",
        }),
      });

      await expect(Security.executeHoldByPartition(executeHoldByPartitionRequest)).rejects.toThrow(ValidationError);
    });
  });
});
