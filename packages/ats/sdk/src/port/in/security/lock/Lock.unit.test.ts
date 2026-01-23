// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  GetLockCountRequest,
  GetLockedBalanceRequest,
  GetLockRequest,
  GetLocksIdRequest,
  LockRequest,
  ReleaseRequest,
} from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import {
  GetLockCountRequestFixture,
  GetLockedBalanceRequestFixture,
  GetLockRequestFixture,
  GetLocksIdRequestFixture,
  LockFixture,
  LockRequestFixture,
  ReleaseRequestFixture,
} from "@test/fixtures/lock/LockFixture";

import { LockCommand } from "@command/security/operations/lock/LockCommand";
import { ReleaseCommand } from "@command/security/operations/release/ReleaseCommand";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { BigNumber } from "ethers";
import { LockedBalanceOfQuery } from "@query/security/lockedBalanceOf/LockedBalanceOfQuery";
import { LockCountQuery } from "@query/security/lockCount/LockCountQuery";
import { LocksIdQuery } from "@query/security/locksId/LocksIdQuery";
import { GetLockQuery } from "@query/security/getLock/GetLockQuery";

describe("Lock", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let lockRequest: LockRequest;
  let releaseRequest: ReleaseRequest;
  let getLockedBalanceRequest: GetLockedBalanceRequest;
  let getLockCountRequest: GetLockCountRequest;
  let getLocksIdRequest: GetLocksIdRequest;
  let getLockRequest: GetLockRequest;

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

  describe("lock", () => {
    lockRequest = new LockRequest(LockRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should lock successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.lock(lockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("LockRequest", lockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new LockCommand(
          lockRequest.amount,
          lockRequest.targetId,
          lockRequest.securityId,
          lockRequest.expirationTimestamp,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.lock(lockRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("LockRequest", lockRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new LockCommand(
          lockRequest.amount,
          lockRequest.targetId,
          lockRequest.securityId,
          lockRequest.expirationTimestamp,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      lockRequest = new LockRequest({
        ...LockRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.lock(lockRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      lockRequest = new LockRequest({
        ...LockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.lock(lockRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amount is invalid", async () => {
      lockRequest = new LockRequest({
        ...LockRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.lock(lockRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("release", () => {
    releaseRequest = new ReleaseRequest(ReleaseRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should release successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.release(releaseRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("ReleaseRequest", releaseRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ReleaseCommand(releaseRequest.lockId, releaseRequest.targetId, releaseRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.release(releaseRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("ReleaseRequest", releaseRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ReleaseCommand(releaseRequest.lockId, releaseRequest.targetId, releaseRequest.securityId),
      );
    });

    it("should throw error if targetId is invalid", async () => {
      releaseRequest = new ReleaseRequest({
        ...ReleaseRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.release(releaseRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if securityId is invalid", async () => {
      releaseRequest = new ReleaseRequest({
        ...ReleaseRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.release(releaseRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getLockedBalanceOf", () => {
    getLockedBalanceRequest = new GetLockedBalanceRequest(GetLockedBalanceRequestFixture.create());

    const expectedResponse = {
      payload: new BigDecimal(BigNumber.from(0)),
    };
    it("should get locked balance of successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getLockedBalanceOf(getLockedBalanceRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLockedBalanceRequest", getLockedBalanceRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new LockedBalanceOfQuery(getLockedBalanceRequest.securityId, getLockedBalanceRequest.targetId),
      );
      expect(result).toEqual(
        expect.objectContaining({
          value: expectedResponse.payload.toString(),
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getLockedBalanceOf(getLockedBalanceRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLockedBalanceRequest", getLockedBalanceRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new LockedBalanceOfQuery(getLockedBalanceRequest.securityId, getLockedBalanceRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getLockedBalanceRequest = new GetLockedBalanceRequest({
        ...GetLockedBalanceRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.release(releaseRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      getLockedBalanceRequest = new GetLockedBalanceRequest({
        ...GetLockedBalanceRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.release(releaseRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getLockCount", () => {
    getLockCountRequest = new GetLockCountRequest(GetLockCountRequestFixture.create());

    const expectedResponse = {
      payload: 1,
    };
    it("should get lock count successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getLockCount(getLockCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLockCountRequest", getLockCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new LockCountQuery(getLockCountRequest.securityId, getLockCountRequest.targetId),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getLockCount(getLockCountRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLockCountRequest", getLockCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new LockCountQuery(getLockCountRequest.securityId, getLockCountRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getLockCountRequest = new GetLockCountRequest({
        ...GetLockCountRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getLockCount(getLockCountRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      getLockCountRequest = new GetLockCountRequest({
        ...GetLockCountRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getLockCount(getLockCountRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getLocksId", () => {
    getLocksIdRequest = new GetLocksIdRequest(GetLocksIdRequestFixture.create());

    const expectedResponse = {
      payload: [BigNumber.from(1)],
    };
    it("should get locks id successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getLocksId(getLocksIdRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLocksIdRequest", getLocksIdRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new LocksIdQuery(
          getLocksIdRequest.securityId,
          getLocksIdRequest.targetId,
          getLocksIdRequest.start,
          getLocksIdRequest.end,
        ),
      );
      expect(result).toEqual([expectedResponse.payload[0].toString()]);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getLocksId(getLocksIdRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLocksIdRequest", getLocksIdRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new LocksIdQuery(
          getLocksIdRequest.securityId,
          getLocksIdRequest.targetId,
          getLocksIdRequest.start,
          getLocksIdRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getLocksIdRequest = new GetLocksIdRequest({
        ...GetLocksIdRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getLockCount(getLockCountRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      getLocksIdRequest = new GetLocksIdRequest({
        ...GetLocksIdRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getLockCount(getLockCountRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getLock", () => {
    getLockRequest = new GetLockRequest(GetLockRequestFixture.create());

    const expectedResponse = {
      payload: LockFixture.create(),
    };
    it("should get lock successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getLock(getLockRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLockRequest", getLockRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetLockQuery(getLockRequest.securityId, getLockRequest.targetId, getLockRequest.id),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: expectedResponse.payload.id,
          amount: expectedResponse.payload.amount.toString(),
          expirationDate: expectedResponse.payload.expiredTimestamp.toString(),
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getLock(getLockRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLockRequest", getLockRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetLockQuery(getLockRequest.securityId, getLockRequest.targetId, getLockRequest.id),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getLockRequest = new GetLockRequest({
        ...GetLockRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getLockCount(getLockCountRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      getLockRequest = new GetLockRequest({
        ...GetLockRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getLockCount(getLockCountRequest)).rejects.toThrow(ValidationError);
    });
  });
});
