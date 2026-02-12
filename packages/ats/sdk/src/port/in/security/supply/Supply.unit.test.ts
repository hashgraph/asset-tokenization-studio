// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { GetMaxSupplyRequest, SetMaxSupplyRequest } from "../../request";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";

import { GetMaxSupplyRequestFixture, SetMaxSupplyRequestFixture } from "@test/fixtures/erc1400/ERC1400Fixture";
import { SetMaxSupplyCommand } from "@command/security/operations/cap/SetMaxSupplyCommand";
import { GetMaxSupplyQuery } from "@query/security/cap/getMaxSupply/GetMaxSupplyQuery";

describe("Supply", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let setMaxSupplyRequest: SetMaxSupplyRequest;
  let getMaxSupplyRequest: GetMaxSupplyRequest;

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

  describe("setMaxSupply", () => {
    setMaxSupplyRequest = new SetMaxSupplyRequest(SetMaxSupplyRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };
    it("should set max supply successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.setMaxSupply(setMaxSupplyRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetMaxSupplyRequest", setMaxSupplyRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetMaxSupplyCommand(setMaxSupplyRequest.maxSupply, setMaxSupplyRequest.securityId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.setMaxSupply(setMaxSupplyRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetMaxSupplyRequest", setMaxSupplyRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetMaxSupplyCommand(setMaxSupplyRequest.maxSupply, setMaxSupplyRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setMaxSupplyRequest = new SetMaxSupplyRequest({
        ...SetMaxSupplyRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.setMaxSupply(setMaxSupplyRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if maxSupply is invalid", async () => {
      setMaxSupplyRequest = new SetMaxSupplyRequest({
        ...SetMaxSupplyRequestFixture.create({
          maxSupply: "invalid",
        }),
      });

      await expect(Security.setMaxSupply(setMaxSupplyRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getMaxSupply", () => {
    getMaxSupplyRequest = new GetMaxSupplyRequest(GetMaxSupplyRequestFixture.create());

    const expectedResponse = {
      payload: new BigDecimal(BigInt(1)),
    };
    it("should get max supply successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getMaxSupply(getMaxSupplyRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetMaxSupplyRequest", getMaxSupplyRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetMaxSupplyQuery(getMaxSupplyRequest.securityId));
      expect(result).toEqual(
        expect.objectContaining({
          value: expectedResponse.payload.toString(),
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getMaxSupply(getMaxSupplyRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetMaxSupplyRequest", getMaxSupplyRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetMaxSupplyQuery(getMaxSupplyRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      getMaxSupplyRequest = new GetMaxSupplyRequest({
        ...GetMaxSupplyRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getMaxSupply(getMaxSupplyRequest)).rejects.toThrow(ValidationError);
    });
  });
});
