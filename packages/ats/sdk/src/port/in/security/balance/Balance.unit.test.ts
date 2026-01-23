// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { GetAccountBalanceRequest } from "../../request";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { GetAccountBalanceRequestFixture } from "@test/fixtures/account/AccountFixture";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { BigNumber } from "ethers";
import { BalanceOfQuery } from "@query/security/balanceof/BalanceOfQuery";

describe("Balance", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let getAccountBalanceRequest: GetAccountBalanceRequest;

  let handleValidationSpy: jest.SpyInstance;

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

  describe("getBalanceOf", () => {
    getAccountBalanceRequest = new GetAccountBalanceRequest(GetAccountBalanceRequestFixture.create());

    const expectedResponse = {
      payload: new BigDecimal(BigNumber.from(1)),
    };
    it("should get balance of successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getBalanceOf(getAccountBalanceRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAccountBalanceRequest", getAccountBalanceRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new BalanceOfQuery(getAccountBalanceRequest.securityId, getAccountBalanceRequest.targetId),
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

      await expect(Security.getBalanceOf(getAccountBalanceRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAccountBalanceRequest", getAccountBalanceRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new BalanceOfQuery(getAccountBalanceRequest.securityId, getAccountBalanceRequest.targetId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getAccountBalanceRequest = new GetAccountBalanceRequest({
        ...GetAccountBalanceRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getBalanceOf(getAccountBalanceRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if targetId is invalid", async () => {
      getAccountBalanceRequest = new GetAccountBalanceRequest({
        ...GetAccountBalanceRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(Security.getBalanceOf(getAccountBalanceRequest)).rejects.toThrow(ValidationError);
    });
  });
});
