// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  BatchFreezePartialTokensRequest,
  BatchSetAddressFrozenRequest,
  BatchUnfreezePartialTokensRequest,
  GetFrozenPartialTokensRequest,
  UnfreezePartialTokensRequest,
  SetAddressFrozenRequest,
  FreezePartialTokensRequest,
} from "../../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";

import {
  BatchFreezePartialTokensResponse,
  BatchFreezePartialTokensCommand,
} from "@command/security/operations/batch/batchFreezePartialTokens/BatchFreezePartialTokensCommand";
import {
  BatchSetAddressFrozenResponse,
  BatchSetAddressFrozenCommand,
} from "@command/security/operations/batch/batchSetAddressFrozen/BatchSetAddressFrozenCommand";
import {
  BatchUnfreezePartialTokensResponse,
  BatchUnfreezePartialTokensCommand,
} from "@command/security/operations/batch/batchUnfreezePartialTokens/BatchUnfreezePartialTokensCommand";
import {
  FreezePartialTokensResponse,
  FreezePartialTokensCommand,
} from "@command/security/operations/freeze/freezePartialTokens/FreezePartialTokensCommand";
import {
  UnfreezePartialTokensResponse,
  UnfreezePartialTokensCommand,
} from "@command/security/operations/freeze/unfreezePartialTokens/UnfreezePartialTokensCommand";
import { GetFrozenPartialTokensQuery } from "@query/security/freeze/getFrozenPartialTokens/GetFrozenPartialTokensQuery";
import {
  BatchSetAddressFrozenRequestFixture,
  BatchFreezePartialTokensRequestFixture,
  BatchUnfreezePartialTokensRequestFixture,
} from "@test/fixtures/batch/BatchFixture";
import {
  FreezePartialTokensRequestFixture,
  UnfreezePartialTokensRequestFixture,
  GetFrozenPartialTokensQueryFixture,
  SetAddressFrozenRequestFixture,
} from "@test/fixtures/freeze/FreezeFixture";
import {
  SetAddressFrozenCommandResponse,
  SetAddressFrozenCommand,
} from "@command/security/operations/freeze/setAddressFrozen/SetAddressFrozenCommand";

describe("Freeze", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let setAddressFrozenRequest: SetAddressFrozenRequest;
  let freezePartialTokensRequest: FreezePartialTokensRequest;
  let unfreezePartialTokensRequest: UnfreezePartialTokensRequest;
  let getFrozenPartialTokensRequest: GetFrozenPartialTokensRequest;
  let batchSetAddressFrozenRequest: BatchSetAddressFrozenRequest;
  let batchFreezePartialTokensRequest: BatchFreezePartialTokensRequest;
  let batchUnfreezePartialTokensRequest: BatchUnfreezePartialTokensRequest;

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

  describe("SetAddressFrozen", () => {
    setAddressFrozenRequest = new SetAddressFrozenRequest(SetAddressFrozenRequestFixture.create());
    const expectedResponse = new SetAddressFrozenCommandResponse(true, transactionId);
    it("should freeze address sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.setAddressFrozen(setAddressFrozenRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetAddressFrozenRequest", setAddressFrozenRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetAddressFrozenCommand(
          setAddressFrozenRequest.securityId,
          setAddressFrozenRequest.status,
          setAddressFrozenRequest.targetId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.setAddressFrozen(setAddressFrozenRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetAddressFrozenRequest", setAddressFrozenRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetAddressFrozenCommand(
          setAddressFrozenRequest.securityId,
          setAddressFrozenRequest.status,
          setAddressFrozenRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setAddressFrozenRequest = new SetAddressFrozenRequest({
        ...SetAddressFrozenRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.setAddressFrozen(setAddressFrozenRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is empty", async () => {
      setAddressFrozenRequest = new SetAddressFrozenRequest({
        ...SetAddressFrozenRequestFixture.create({
          targetId: "",
        }),
      });

      await expect(Security.setAddressFrozen(setAddressFrozenRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if status is string", async () => {
      setAddressFrozenRequest = new SetAddressFrozenRequest({
        ...SetAddressFrozenRequestFixture.create({
          status: "" as unknown as boolean,
        }),
      });

      await expect(Security.setAddressFrozen(setAddressFrozenRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("FreezePartialTokens", () => {
    freezePartialTokensRequest = new FreezePartialTokensRequest(FreezePartialTokensRequestFixture.create());
    const expectedResponse = new FreezePartialTokensResponse(true, transactionId);
    it("should freeze partial tokens sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.freezePartialTokens(freezePartialTokensRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("FreezePartialTokensRequest", freezePartialTokensRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new FreezePartialTokensCommand(
          freezePartialTokensRequest.securityId,
          freezePartialTokensRequest.amount,
          freezePartialTokensRequest.targetId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.freezePartialTokens(freezePartialTokensRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("FreezePartialTokensRequest", freezePartialTokensRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new FreezePartialTokensCommand(
          freezePartialTokensRequest.securityId,
          freezePartialTokensRequest.amount,
          freezePartialTokensRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      freezePartialTokensRequest = new FreezePartialTokensRequest({
        ...FreezePartialTokensRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.freezePartialTokens(freezePartialTokensRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is empty", async () => {
      freezePartialTokensRequest = new FreezePartialTokensRequest({
        ...FreezePartialTokensRequestFixture.create({
          targetId: "",
        }),
      });

      await expect(Security.freezePartialTokens(freezePartialTokensRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("UnfreezePartialTokens", () => {
    unfreezePartialTokensRequest = new UnfreezePartialTokensRequest(FreezePartialTokensRequestFixture.create());
    const expectedResponse = new UnfreezePartialTokensResponse(true, transactionId);
    it("should unfreeze partial tokens sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.unfreezePartialTokens(unfreezePartialTokensRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("UnfreezePartialTokensRequest", unfreezePartialTokensRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UnfreezePartialTokensCommand(
          unfreezePartialTokensRequest.securityId,
          unfreezePartialTokensRequest.amount,
          unfreezePartialTokensRequest.targetId,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.unfreezePartialTokens(unfreezePartialTokensRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("UnfreezePartialTokensRequest", unfreezePartialTokensRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UnfreezePartialTokensCommand(
          unfreezePartialTokensRequest.securityId,
          unfreezePartialTokensRequest.amount,
          unfreezePartialTokensRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      unfreezePartialTokensRequest = new UnfreezePartialTokensRequest({
        ...UnfreezePartialTokensRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.unfreezePartialTokens(unfreezePartialTokensRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is empty", async () => {
      unfreezePartialTokensRequest = new UnfreezePartialTokensRequest({
        ...UnfreezePartialTokensRequestFixture.create({
          targetId: "",
        }),
      });

      await expect(Security.unfreezePartialTokens(unfreezePartialTokensRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getFrozenPartialTokens", () => {
    getFrozenPartialTokensRequest = new GetFrozenPartialTokensRequest(GetFrozenPartialTokensQueryFixture.create());

    const expectedResponse = {
      payload: new BigDecimal(BigInt(1)),
    };
    it("should get hold count for by partition successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getFrozenPartialTokens(getFrozenPartialTokensRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetFrozenPartialTokensRequest", getFrozenPartialTokensRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetFrozenPartialTokensQuery(
          getFrozenPartialTokensRequest.securityId,
          getFrozenPartialTokensRequest.targetId,
        ),
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

      await expect(Security.getFrozenPartialTokens(getFrozenPartialTokensRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("GetFrozenPartialTokensRequest", getFrozenPartialTokensRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetFrozenPartialTokensQuery(
          getFrozenPartialTokensRequest.securityId,
          getFrozenPartialTokensRequest.targetId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getFrozenPartialTokensRequest = new GetFrozenPartialTokensRequest({
        ...GetFrozenPartialTokensQueryFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getFrozenPartialTokens(getFrozenPartialTokensRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      getFrozenPartialTokensRequest = new GetFrozenPartialTokensRequest({
        ...GetFrozenPartialTokensQueryFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getFrozenPartialTokens(getFrozenPartialTokensRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("BatchSetAddressFrozen", () => {
    batchSetAddressFrozenRequest = new BatchSetAddressFrozenRequest(BatchSetAddressFrozenRequestFixture.create());
    const expectedResponse = new BatchSetAddressFrozenResponse(true, transactionId);
    it("should batch set address frozen sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.batchSetAddressFrozen(batchSetAddressFrozenRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchSetAddressFrozenRequest", batchSetAddressFrozenRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchSetAddressFrozenCommand(
          batchSetAddressFrozenRequest.securityId,
          batchSetAddressFrozenRequest.freezeList,
          batchSetAddressFrozenRequest.targetList,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.batchSetAddressFrozen(batchSetAddressFrozenRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchSetAddressFrozenRequest", batchSetAddressFrozenRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchSetAddressFrozenCommand(
          batchSetAddressFrozenRequest.securityId,
          batchSetAddressFrozenRequest.freezeList,
          batchSetAddressFrozenRequest.targetList,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      batchSetAddressFrozenRequest = new BatchSetAddressFrozenRequest({
        ...BatchSetAddressFrozenRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.batchSetAddressFrozen(batchSetAddressFrozenRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if freezeList is empty", async () => {
      batchSetAddressFrozenRequest = new BatchSetAddressFrozenRequest({
        ...BatchSetAddressFrozenRequestFixture.create({
          freezeList: [],
        }),
      });

      await expect(Security.batchSetAddressFrozen(batchSetAddressFrozenRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetList is empty", async () => {
      batchSetAddressFrozenRequest = new BatchSetAddressFrozenRequest({
        ...BatchSetAddressFrozenRequestFixture.create({
          targetList: [],
        }),
      });

      await expect(Security.batchSetAddressFrozen(batchSetAddressFrozenRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if list lengths are not equal", async () => {
      batchSetAddressFrozenRequest = new BatchSetAddressFrozenRequest({
        ...BatchSetAddressFrozenRequestFixture.create({
          targetList: [HederaIdPropsFixture.create().value, HederaIdPropsFixture.create().value],
        }),
      });

      await expect(Security.batchSetAddressFrozen(batchSetAddressFrozenRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("BatchFreezePartialTokens", () => {
    batchFreezePartialTokensRequest = new BatchFreezePartialTokensRequest(
      BatchFreezePartialTokensRequestFixture.create(),
    );
    const expectedResponse = new BatchFreezePartialTokensResponse(true, transactionId);
    it("should batch freeze partial tokens sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.batchFreezePartialTokens(batchFreezePartialTokensRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "BatchFreezePartialTokensRequest",
        batchFreezePartialTokensRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchFreezePartialTokensCommand(
          batchFreezePartialTokensRequest.securityId,
          batchFreezePartialTokensRequest.amountList,
          batchFreezePartialTokensRequest.targetList,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.batchFreezePartialTokens(batchFreezePartialTokensRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "BatchFreezePartialTokensRequest",
        batchFreezePartialTokensRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchFreezePartialTokensCommand(
          batchFreezePartialTokensRequest.securityId,
          batchFreezePartialTokensRequest.amountList,
          batchFreezePartialTokensRequest.targetList,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      batchFreezePartialTokensRequest = new BatchFreezePartialTokensRequest({
        ...BatchFreezePartialTokensRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.batchFreezePartialTokens(batchFreezePartialTokensRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amountList is empty", async () => {
      batchFreezePartialTokensRequest = new BatchFreezePartialTokensRequest({
        ...BatchFreezePartialTokensRequestFixture.create({
          amountList: [],
        }),
      });

      await expect(Security.batchFreezePartialTokens(batchFreezePartialTokensRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetList is empty", async () => {
      batchFreezePartialTokensRequest = new BatchFreezePartialTokensRequest({
        ...BatchFreezePartialTokensRequestFixture.create({
          targetList: [],
        }),
      });

      await expect(Security.batchFreezePartialTokens(batchFreezePartialTokensRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if list lengths are not equal", async () => {
      batchFreezePartialTokensRequest = new BatchFreezePartialTokensRequest({
        ...BatchFreezePartialTokensRequestFixture.create({
          targetList: [HederaIdPropsFixture.create().value, HederaIdPropsFixture.create().value],
        }),
      });

      await expect(Security.batchFreezePartialTokens(batchFreezePartialTokensRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("BatchUnfreezePartialTokens", () => {
    batchUnfreezePartialTokensRequest = new BatchUnfreezePartialTokensRequest(
      BatchUnfreezePartialTokensRequestFixture.create(),
    );
    const expectedResponse = new BatchUnfreezePartialTokensResponse(true, transactionId);
    it("should batch freeze partial tokens sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.batchUnfreezePartialTokens(batchUnfreezePartialTokensRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "BatchUnfreezePartialTokensRequest",
        batchUnfreezePartialTokensRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchUnfreezePartialTokensCommand(
          batchUnfreezePartialTokensRequest.securityId,
          batchUnfreezePartialTokensRequest.amountList,
          batchUnfreezePartialTokensRequest.targetList,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.batchUnfreezePartialTokens(batchUnfreezePartialTokensRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "BatchUnfreezePartialTokensRequest",
        batchUnfreezePartialTokensRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchUnfreezePartialTokensCommand(
          batchUnfreezePartialTokensRequest.securityId,
          batchUnfreezePartialTokensRequest.amountList,
          batchUnfreezePartialTokensRequest.targetList,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      batchUnfreezePartialTokensRequest = new BatchUnfreezePartialTokensRequest({
        ...BatchUnfreezePartialTokensRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.batchUnfreezePartialTokens(batchUnfreezePartialTokensRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if amountList is empty", async () => {
      batchUnfreezePartialTokensRequest = new BatchUnfreezePartialTokensRequest({
        ...BatchUnfreezePartialTokensRequestFixture.create({
          amountList: [],
        }),
      });

      await expect(Security.batchUnfreezePartialTokens(batchUnfreezePartialTokensRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if targetList is empty", async () => {
      batchUnfreezePartialTokensRequest = new BatchUnfreezePartialTokensRequest({
        ...BatchUnfreezePartialTokensRequestFixture.create({
          targetList: [],
        }),
      });

      await expect(Security.batchUnfreezePartialTokens(batchUnfreezePartialTokensRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if list lengths are not equal", async () => {
      batchUnfreezePartialTokensRequest = new BatchUnfreezePartialTokensRequest({
        ...BatchUnfreezePartialTokensRequestFixture.create({
          targetList: [HederaIdPropsFixture.create().value, HederaIdPropsFixture.create().value],
        }),
      });

      await expect(Security.batchUnfreezePartialTokens(batchUnfreezePartialTokensRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
