// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { BatchMintRequest, IssueRequest, MintRequest } from "../../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { IssueRequestFixture } from "@test/fixtures/issue/IssueFixture";
import { IssueCommand } from "@command/security/operations/issue/IssueCommand";
import { BatchMintResponse, BatchMintCommand } from "@command/security/operations/batch/batchMint/BatchMintCommand";
import { MintCommand } from "@command/security/operations/mint/MintCommand";
import { BatchMintRequestFixture } from "@test/fixtures/batch/BatchFixture";
import { MintRequestFixture } from "@test/fixtures/mint/MintFixture";

describe("Issue", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let issueRequest: IssueRequest;
  let mintRequest: MintRequest;
  let batchMintRequest: BatchMintRequest;

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

  describe("issue", () => {
    issueRequest = new IssueRequest(IssueRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should issue successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.issue(issueRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IssueRequest", issueRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new IssueCommand(issueRequest.amount, issueRequest.targetId, issueRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.issue(issueRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("IssueRequest", issueRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new IssueCommand(issueRequest.amount, issueRequest.targetId, issueRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      issueRequest = new IssueRequest({
        ...IssueRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.issue(issueRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      issueRequest = new IssueRequest({
        ...IssueRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.issue(issueRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if amount is invalid", async () => {
      issueRequest = new IssueRequest({
        ...IssueRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.issue(issueRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("mint", () => {
    mintRequest = new MintRequest(MintRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should mint successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.mint(mintRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("MintRequest", mintRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new MintCommand(mintRequest.securityId, mintRequest.targetId, mintRequest.amount),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.mint(mintRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("MintRequest", mintRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new MintCommand(mintRequest.securityId, mintRequest.targetId, mintRequest.amount),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      mintRequest = new MintRequest({
        ...MintRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.mint(mintRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      mintRequest = new MintRequest({
        ...MintRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.mint(mintRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if amount is invalid", async () => {
      mintRequest = new MintRequest({
        ...MintRequestFixture.create({
          amount: "invalid",
        }),
      });

      await expect(Security.mint(mintRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("BatchMint", () => {
    batchMintRequest = new BatchMintRequest(BatchMintRequestFixture.create());
    const expectedResponse = new BatchMintResponse(true, transactionId);
    it("should batch mint sucessfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.batchMint(batchMintRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchMintRequest", batchMintRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchMintCommand(batchMintRequest.securityId, batchMintRequest.amountList, batchMintRequest.toList),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.batchMint(batchMintRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("BatchMintRequest", batchMintRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new BatchMintCommand(batchMintRequest.securityId, batchMintRequest.amountList, batchMintRequest.toList),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      batchMintRequest = new BatchMintRequest({
        ...BatchMintRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.batchMint(batchMintRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amountList is empty", async () => {
      batchMintRequest = new BatchMintRequest({
        ...BatchMintRequestFixture.create({
          amountList: [],
        }),
      });

      await expect(Security.batchMint(batchMintRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if toList is empty", async () => {
      batchMintRequest = new BatchMintRequest({
        ...BatchMintRequestFixture.create({
          toList: [],
        }),
      });

      await expect(Security.batchMint(batchMintRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if list lengths are not equal", async () => {
      batchMintRequest = new BatchMintRequest({
        ...BatchMintRequestFixture.create({
          toList: [HederaIdPropsFixture.create().value, HederaIdPropsFixture.create().value],
        }),
      });

      await expect(Security.batchMint(batchMintRequest)).rejects.toThrow(ValidationError);
    });
  });
});
