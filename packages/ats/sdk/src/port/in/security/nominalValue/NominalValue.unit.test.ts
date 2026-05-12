// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { QueryBus } from "@core/query/QueryBus";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import LogService from "@service/log/LogService";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import Security from "@port/in/security/Security";
import {
  SetNominalValueRequestFixture,
  SetNominalValueCurrencyRequestFixture,
  GetNominalValueRequestFixture,
  GetNominalValueDecimalsRequestFixture,
  GetNominalValueCurrencyRequestFixture,
} from "@test/fixtures/nominalValue/NominalValueFixture";
import {
  SetNominalValueRequest,
  SetNominalValueCurrencyRequest,
  GetNominalValueRequest,
  GetNominalValueDecimalsRequest,
  GetNominalValueCurrencyRequest,
} from "../../request";
import { SetNominalValueCommand } from "@command/security/nominalValue/setNominalValue/SetNominalValueCommand";
import { SetNominalValueCurrencyCommand } from "@command/security/nominalValue/setNominalValueCurrency/SetNominalValueCurrencyCommand";
import { GetNominalValueQuery } from "@query/security/nominalValue/getNominalValue/GetNominalValueQuery";
import { GetNominalValueDecimalsQuery } from "@query/security/nominalValue/getNominalValueDecimals/GetNominalValueDecimalsQuery";
import { GetNominalValueCurrencyQuery } from "@query/security/nominalValue/getNominalValueCurrency/GetNominalValueCurrencyQuery";
import BigDecimal from "@domain/context/shared/BigDecimal";

describe("NominalValue", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

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

  describe("setNominalValue", () => {
    const setNominalValueRequest = new SetNominalValueRequest(SetNominalValueRequestFixture.create());

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };

    it("should set nominal value successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.setNominalValue(setNominalValueRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetNominalValueRequest", setNominalValueRequest);
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetNominalValueCommand(
          setNominalValueRequest.securityId,
          setNominalValueRequest.nominalValue,
          setNominalValueRequest.nominalValueDecimals,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.setNominalValue(setNominalValueRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetNominalValueRequest", setNominalValueRequest);
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetNominalValueCommand(
          setNominalValueRequest.securityId,
          setNominalValueRequest.nominalValue,
          setNominalValueRequest.nominalValueDecimals,
        ),
      );
    });

    it("should throw ValidationError if securityId is invalid", async () => {
      const invalidRequest = new SetNominalValueRequest({
        ...SetNominalValueRequestFixture.create({ securityId: "invalid" }),
      });

      await expect(Security.setNominalValue(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if nominalValue is empty", async () => {
      const invalidRequest = new SetNominalValueRequest({
        ...SetNominalValueRequestFixture.create({ nominalValue: "" }),
      });

      await expect(Security.setNominalValue(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getNominalValue", () => {
    const getNominalValueRequest = new GetNominalValueRequest(GetNominalValueRequestFixture.create());

    it("should get nominal value successfully", async () => {
      const nominalValue = new BigDecimal("1000");
      queryBusMock.execute.mockResolvedValue({ payload: nominalValue });

      const result = await Security.getNominalValue(getNominalValueRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetNominalValueRequest", getNominalValueRequest);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetNominalValueQuery(getNominalValueRequest.securityId));
      expect(result).toEqual(nominalValue.toString());
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getNominalValue(getNominalValueRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetNominalValueRequest", getNominalValueRequest);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetNominalValueQuery(getNominalValueRequest.securityId));
    });

    it("should throw ValidationError if securityId is invalid", async () => {
      const invalidRequest = new GetNominalValueRequest({
        ...GetNominalValueRequestFixture.create({ securityId: "invalid" }),
      });

      await expect(Security.getNominalValue(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getNominalValueDecimals", () => {
    const getNominalValueDecimalsRequest = new GetNominalValueDecimalsRequest(
      GetNominalValueDecimalsRequestFixture.create(),
    );

    it("should get nominal value decimals successfully", async () => {
      const decimals = 6;
      queryBusMock.execute.mockResolvedValue({ payload: decimals });

      const result = await Security.getNominalValueDecimals(getNominalValueDecimalsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetNominalValueDecimalsRequest",
        getNominalValueDecimalsRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetNominalValueDecimalsQuery(getNominalValueDecimalsRequest.securityId),
      );
      expect(result).toBe(decimals);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getNominalValueDecimals(getNominalValueDecimalsRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetNominalValueDecimalsRequest",
        getNominalValueDecimalsRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetNominalValueDecimalsQuery(getNominalValueDecimalsRequest.securityId),
      );
    });

    it("should throw ValidationError if securityId is invalid", async () => {
      const invalidRequest = new GetNominalValueDecimalsRequest({
        ...GetNominalValueDecimalsRequestFixture.create({ securityId: "invalid" }),
      });

      await expect(Security.getNominalValueDecimals(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("setNominalValueCurrency", () => {
    const setNominalValueCurrencyRequest = new SetNominalValueCurrencyRequest(
      SetNominalValueCurrencyRequestFixture.create(),
    );

    const expectedResponse = {
      payload: true,
      transactionId: transactionId,
    };

    it("should set nominal value currency successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.setNominalValueCurrency(setNominalValueCurrencyRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "SetNominalValueCurrencyRequest",
        setNominalValueCurrencyRequest,
      );
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetNominalValueCurrencyCommand(
          setNominalValueCurrencyRequest.securityId,
          setNominalValueCurrencyRequest.nominalValueCurrency,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Security.setNominalValueCurrency(setNominalValueCurrencyRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetNominalValueCurrencyCommand(
          setNominalValueCurrencyRequest.securityId,
          setNominalValueCurrencyRequest.nominalValueCurrency,
        ),
      );
    });

    it("should throw ValidationError if securityId is invalid", async () => {
      const invalidRequest = new SetNominalValueCurrencyRequest({
        ...SetNominalValueCurrencyRequestFixture.create({ securityId: "invalid" }),
      });

      await expect(Security.setNominalValueCurrency(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if nominalValueCurrency is empty", async () => {
      const invalidRequest = new SetNominalValueCurrencyRequest({
        ...SetNominalValueCurrencyRequestFixture.create({ nominalValueCurrency: "" }),
      });

      await expect(Security.setNominalValueCurrency(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if nominalValueCurrency is a non-bytes3 string (e.g. ASCII 'USD')", async () => {
      const invalidRequest = new SetNominalValueCurrencyRequest({
        ...SetNominalValueCurrencyRequestFixture.create({ nominalValueCurrency: "USD" }),
      });

      await expect(Security.setNominalValueCurrency(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if nominalValueCurrency hex is too long", async () => {
      const invalidRequest = new SetNominalValueCurrencyRequest({
        ...SetNominalValueCurrencyRequestFixture.create({ nominalValueCurrency: "0x55534455" }),
      });

      await expect(Security.setNominalValueCurrency(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getNominalValueCurrency", () => {
    const getNominalValueCurrencyRequest = new GetNominalValueCurrencyRequest(
      GetNominalValueCurrencyRequestFixture.create(),
    );

    it("should get nominal value currency successfully", async () => {
      const currency = "0x555344"; // USD
      queryBusMock.execute.mockResolvedValue({ payload: currency });

      const result = await Security.getNominalValueCurrency(getNominalValueCurrencyRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetNominalValueCurrencyRequest",
        getNominalValueCurrencyRequest,
      );
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetNominalValueCurrencyQuery(getNominalValueCurrencyRequest.securityId),
      );
      expect(result).toBe(currency);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getNominalValueCurrency(getNominalValueCurrencyRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetNominalValueCurrencyQuery(getNominalValueCurrencyRequest.securityId),
      );
    });

    it("should throw ValidationError if securityId is invalid", async () => {
      const invalidRequest = new GetNominalValueCurrencyRequest({
        ...GetNominalValueCurrencyRequestFixture.create({ securityId: "invalid" }),
      });

      await expect(Security.getNominalValueCurrency(invalidRequest)).rejects.toThrow(ValidationError);
    });
  });
});
