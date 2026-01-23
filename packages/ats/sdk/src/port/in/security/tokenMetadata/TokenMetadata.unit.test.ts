// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { SetNameRequest, SetSymbolRequest } from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { SetNameRequestFixture, SetSymbolRequestFixture } from "@test/fixtures/tokenMetadata/TokenMetadataFixture";
import { SetNameCommand } from "@command/security/operations/tokenMetadata/setName/SetNameCommand";
import { SetSymbolCommand } from "@command/security/operations/tokenMetadata/setSymbol/SetSymbolCommand";

describe("Token Metadata", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let setNameRequest: SetNameRequest;
  let setSymbolRequest: SetSymbolRequest;

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

  describe("SetName", () => {
    setNameRequest = new SetNameRequest(SetNameRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should set name successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.setName(setNameRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetNameRequest", setNameRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetNameCommand(setNameRequest.securityId, setNameRequest.name),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.setName(setNameRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetNameRequest", setNameRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetNameCommand(setNameRequest.securityId, setNameRequest.name),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setNameRequest = new SetNameRequest({
        ...SetNameRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.setName(setNameRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if name is empty", async () => {
      setNameRequest = new SetNameRequest({
        ...SetNameRequestFixture.create({
          name: "",
        }),
      });

      await expect(Security.setName(setNameRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("SetSymbol", () => {
    setSymbolRequest = new SetSymbolRequest(SetSymbolRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should set symbol successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.setSymbol(setSymbolRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetSymbolRequest", setSymbolRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetSymbolCommand(setSymbolRequest.securityId, setSymbolRequest.symbol),
      );
      expect(result).toEqual(expectedResponse);
    });
    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.setSymbol(setSymbolRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetSymbolRequest", setSymbolRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetSymbolCommand(setSymbolRequest.securityId, setSymbolRequest.symbol),
      );
    });
    it("should throw error if securityId is invalid", async () => {
      setSymbolRequest = new SetSymbolRequest({
        ...SetSymbolRequestFixture.create({
          securityId: "invalid",
        }),
      });
      await expect(Security.setSymbol(setSymbolRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if symbol is empty", async () => {
      setSymbolRequest = new SetSymbolRequest({
        ...SetSymbolRequestFixture.create({
          symbol: "",
        }),
      });

      await expect(Security.setSymbol(setSymbolRequest)).rejects.toThrow(ValidationError);
    });
  });
});
