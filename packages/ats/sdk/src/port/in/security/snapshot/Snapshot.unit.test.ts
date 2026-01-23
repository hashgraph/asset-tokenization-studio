// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  GetTokenHoldersAtSnapshotRequest,
  GetTotalTokenHoldersAtSnapshotRequest,
  TakeSnapshotRequest,
} from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import {
  GetTokenHoldersAtSnapshotRequestFixture,
  GetTotalTokenHoldersAtSnapshotRequestFixture,
  TakeSnapshotRequestFixture,
} from "@test/fixtures/snapshot/SnapshotFixture";
import { TakeSnapshotCommand } from "@command/security/operations/snapshot/takeSnapshot/TakeSnapshotCommand";
import { GetTokenHoldersAtSnapshotQuery } from "@query/security/snapshot/getTokenHoldersAtSnapshot/GetTokenHoldersAtSnapshotQuery";
import { GetTotalTokenHoldersAtSnapshotQuery } from "@query/security/snapshot/getTotalTokenHoldersAtSnapshot/GetTotalTokenHoldersAtSnapshotQuery";

describe("Snapshot", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let takeSnapshotRequest: TakeSnapshotRequest;
  let getTokenHoldersAtSnapshotRequest: GetTokenHoldersAtSnapshotRequest;
  let getTotalTokenHoldersAtSnapshotRequest: GetTotalTokenHoldersAtSnapshotRequest;

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

  describe("takeSnapshot", () => {
    takeSnapshotRequest = new TakeSnapshotRequest(TakeSnapshotRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should take snapshot successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.takeSnapshot(takeSnapshotRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(TakeSnapshotRequest.name, takeSnapshotRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(new TakeSnapshotCommand(takeSnapshotRequest.securityId));
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.takeSnapshot(takeSnapshotRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(TakeSnapshotRequest.name, takeSnapshotRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(new TakeSnapshotCommand(takeSnapshotRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      takeSnapshotRequest = new TakeSnapshotRequest({
        ...TakeSnapshotRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.takeSnapshot(takeSnapshotRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getTokenHoldersAtSnapshot", () => {
    getTokenHoldersAtSnapshotRequest = new GetTokenHoldersAtSnapshotRequest(
      GetTokenHoldersAtSnapshotRequestFixture.create(),
    );
    it("should get token holders at snapshot successfully", async () => {
      const expectedResponse = {
        payload: [transactionId],
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getTokenHoldersAtSnapshot(getTokenHoldersAtSnapshotRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTokenHoldersAtSnapshotRequest.name,
        getTokenHoldersAtSnapshotRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTokenHoldersAtSnapshotQuery(
          getTokenHoldersAtSnapshotRequest.securityId,
          getTokenHoldersAtSnapshotRequest.snapshotId,
          getTokenHoldersAtSnapshotRequest.start,
          getTokenHoldersAtSnapshotRequest.end,
        ),
      );
      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getTokenHoldersAtSnapshot(getTokenHoldersAtSnapshotRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTokenHoldersAtSnapshotRequest.name,
        getTokenHoldersAtSnapshotRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTokenHoldersAtSnapshotQuery(
          getTokenHoldersAtSnapshotRequest.securityId,
          getTokenHoldersAtSnapshotRequest.snapshotId,
          getTokenHoldersAtSnapshotRequest.start,
          getTokenHoldersAtSnapshotRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getTokenHoldersAtSnapshotRequest = new GetTokenHoldersAtSnapshotRequest({
        ...GetTokenHoldersAtSnapshotRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(Security.getTokenHoldersAtSnapshot(getTokenHoldersAtSnapshotRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if snapshotId is invalid", async () => {
      getTokenHoldersAtSnapshotRequest = new GetTokenHoldersAtSnapshotRequest({
        ...GetTokenHoldersAtSnapshotRequestFixture.create(),
        snapshotId: -1,
      });

      await expect(Security.getTokenHoldersAtSnapshot(getTokenHoldersAtSnapshotRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if start is invalid", async () => {
      getTokenHoldersAtSnapshotRequest = new GetTokenHoldersAtSnapshotRequest({
        ...GetTokenHoldersAtSnapshotRequestFixture.create(),
        start: -1,
      });

      await expect(Security.getTokenHoldersAtSnapshot(getTokenHoldersAtSnapshotRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if end is invalid", async () => {
      getTokenHoldersAtSnapshotRequest = new GetTokenHoldersAtSnapshotRequest({
        ...GetTokenHoldersAtSnapshotRequestFixture.create(),
        end: -1,
      });

      await expect(Security.getTokenHoldersAtSnapshot(getTokenHoldersAtSnapshotRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getTotalTokenHoldersAtSnapshot", () => {
    getTotalTokenHoldersAtSnapshotRequest = new GetTotalTokenHoldersAtSnapshotRequest(
      GetTotalTokenHoldersAtSnapshotRequestFixture.create(),
    );
    it("should get total token holders successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getTotalTokenHoldersAtSnapshot(getTotalTokenHoldersAtSnapshotRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalTokenHoldersAtSnapshotRequest.name,
        getTotalTokenHoldersAtSnapshotRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalTokenHoldersAtSnapshotQuery(
          getTotalTokenHoldersAtSnapshotRequest.securityId,
          getTotalTokenHoldersAtSnapshotRequest.snapshotId,
        ),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getTotalTokenHoldersAtSnapshot(getTotalTokenHoldersAtSnapshotRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalTokenHoldersAtSnapshotRequest.name,
        getTotalTokenHoldersAtSnapshotRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalTokenHoldersAtSnapshotQuery(
          getTotalTokenHoldersAtSnapshotRequest.securityId,
          getTotalTokenHoldersAtSnapshotRequest.snapshotId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getTotalTokenHoldersAtSnapshotRequest = new GetTotalTokenHoldersAtSnapshotRequest({
        ...GetTotalTokenHoldersAtSnapshotRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(Security.getTotalTokenHoldersAtSnapshot(getTotalTokenHoldersAtSnapshotRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if snapshotId is invalid", async () => {
      getTotalTokenHoldersAtSnapshotRequest = new GetTotalTokenHoldersAtSnapshotRequest({
        ...GetTotalTokenHoldersAtSnapshotRequestFixture.create(),
        snapshotId: -1,
      });

      await expect(Security.getTotalTokenHoldersAtSnapshot(getTotalTokenHoldersAtSnapshotRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
