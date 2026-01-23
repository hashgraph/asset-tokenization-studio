// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { GetSecurityDetailsRequest, GetSecurityHoldersRequest, GetTotalSecurityHoldersRequest } from "../../request";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Security from "@port/in/security/Security";
import { GetSecurityDetailsRequestFixture } from "@test/fixtures/erc1400/ERC1400Fixture";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { GetSecurityQuery } from "@query/security/get/GetSecurityQuery";
import {
  GetSecurityHoldersRequestFixture,
  GetTotalSecurityHoldersRequestFixture,
} from "@test/fixtures/security/SecurityFixture";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import { GetSecurityHoldersQuery } from "@query/security/security/getSecurityHolders/GetSecurityHoldersQuery";
import { GetTotalSecurityHoldersQuery } from "@query/security/security/getTotalSecurityHolders/GetTotalSecurityHoldersQuery";

describe("Info", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let getSecurityDetailsRequest: GetSecurityDetailsRequest;
  let getSecurityHoldersRequest: GetSecurityHoldersRequest;
  let getTotalSecurityHoldersRequest: GetTotalSecurityHoldersRequest;

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

  describe("getInfo", () => {
    getSecurityDetailsRequest = new GetSecurityDetailsRequest(GetSecurityDetailsRequestFixture.create());

    const expectedResponse = {
      security: SecurityPropsFixture.create(),
    };
    it("should get security info successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getInfo(getSecurityDetailsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetSecurityDetailsRequest", getSecurityDetailsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetSecurityQuery(getSecurityDetailsRequest.securityId));
      expect(result).toEqual(
        expect.objectContaining({
          name: expectedResponse.security.name,
          symbol: expectedResponse.security.symbol,
          isin: expectedResponse.security.isin,
          type: expectedResponse.security.type,
          decimals: expectedResponse.security.decimals,
          isWhiteList: expectedResponse.security.isWhiteList,
          isControllable: expectedResponse.security.isControllable,
          isMultiPartition: expectedResponse.security.isMultiPartition,
          totalSupply: expectedResponse.security.totalSupply?.toString(),
          maxSupply: expectedResponse.security.maxSupply?.toString(),
          diamondAddress: expectedResponse.security.diamondAddress?.toString(),
          evmDiamondAddress: expectedResponse.security.evmDiamondAddress?.toString(),
          paused: expectedResponse.security.paused,
          regulation: expectedResponse.security.regulation,
          isCountryControlListWhiteList: expectedResponse.security.isCountryControlListWhiteList,
          countries: expectedResponse.security.countries,
          info: expectedResponse.security.info,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getInfo(getSecurityDetailsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetSecurityDetailsRequest", getSecurityDetailsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetSecurityQuery(getSecurityDetailsRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      getSecurityDetailsRequest = new GetSecurityDetailsRequest({
        ...GetSecurityDetailsRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Security.getInfo(getSecurityDetailsRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getSecurityHolders", () => {
    getSecurityHoldersRequest = new GetSecurityHoldersRequest(GetSecurityHoldersRequestFixture.create());
    it("should get token holders at snapshot successfully", async () => {
      const expectedResponse = {
        payload: [transactionId],
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getSecurityHolders(getSecurityHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(GetSecurityHoldersRequest.name, getSecurityHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetSecurityHoldersQuery(
          getSecurityHoldersRequest.securityId,
          getSecurityHoldersRequest.start,
          getSecurityHoldersRequest.end,
        ),
      );
      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getSecurityHolders(getSecurityHoldersRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(GetSecurityHoldersRequest.name, getSecurityHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetSecurityHoldersQuery(
          getSecurityHoldersRequest.securityId,
          getSecurityHoldersRequest.start,
          getSecurityHoldersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getSecurityHoldersRequest = new GetSecurityHoldersRequest({
        ...GetSecurityHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(Security.getSecurityHolders(getSecurityHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if start is invalid", async () => {
      getSecurityHoldersRequest = new GetSecurityHoldersRequest({
        ...GetSecurityHoldersRequestFixture.create(),
        start: -1,
      });

      await expect(Security.getSecurityHolders(getSecurityHoldersRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if end is invalid", async () => {
      getSecurityHoldersRequest = new GetSecurityHoldersRequest({
        ...GetSecurityHoldersRequestFixture.create(),
        end: -1,
      });

      await expect(Security.getSecurityHolders(getSecurityHoldersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getTotalSecurityHolders", () => {
    getTotalSecurityHoldersRequest = new GetTotalSecurityHoldersRequest(GetTotalSecurityHoldersRequestFixture.create());
    it("should get total security holders successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Security.getTotalSecurityHolders(getTotalSecurityHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalSecurityHoldersRequest.name,
        getTotalSecurityHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalSecurityHoldersQuery(getTotalSecurityHoldersRequest.securityId),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Security.getTotalSecurityHolders(getTotalSecurityHoldersRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalSecurityHoldersRequest.name,
        getTotalSecurityHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalSecurityHoldersQuery(getTotalSecurityHoldersRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getTotalSecurityHoldersRequest = new GetTotalSecurityHoldersRequest({
        ...GetTotalSecurityHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(Security.getTotalSecurityHolders(getTotalSecurityHoldersRequest)).rejects.toThrow(ValidationError);
    });
  });
});
