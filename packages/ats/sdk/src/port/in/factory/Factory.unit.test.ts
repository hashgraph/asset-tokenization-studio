// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { GetRegulationDetailsRequest } from "../request";
import { HederaIdPropsFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import NetworkService from "@service/network/NetworkService";
import ContractId from "@domain/context/contract/ContractId";
import Factory from "./Factory";
import { GetRegulationDetailsRequestFixture } from "@test/fixtures/factory/FactoryFixture";
import { RegulationFixture } from "@test/fixtures/shared/RegulationFixture";
import { GetRegulationDetailsQuery } from "@query/factory/get/GetRegulationDetailsQuery";

describe("Factory", () => {
  let queryBusMock: jest.Mocked<QueryBus>;
  let networkServiceMock: jest.Mocked<NetworkService>;

  let getRegulationDetailsRequest: GetRegulationDetailsRequest;

  let handleValidationSpy: jest.SpyInstance;

  const factoryAddress = HederaIdPropsFixture.create().value;

  beforeEach(() => {
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    networkServiceMock = createMock<NetworkService>({
      configuration: {
        factoryAddress: factoryAddress,
      },
    });
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (Factory as any).queryBus = queryBusMock;
    (Factory as any).networkService = networkServiceMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("getRegulationDetails", () => {
    getRegulationDetailsRequest = new GetRegulationDetailsRequest(GetRegulationDetailsRequestFixture.create());
    it("should get regulation details successfully", async () => {
      const expectedResponse = {
        regulation: RegulationFixture.create(),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Factory.getRegulationDetails(getRegulationDetailsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRegulationDetailsRequest", getRegulationDetailsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRegulationDetailsQuery(
          getRegulationDetailsRequest.regulationType,
          getRegulationDetailsRequest.regulationSubType,
          new ContractId(factoryAddress),
        ),
      );

      expect(result).toEqual(expectedResponse.regulation);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Factory.getRegulationDetails(getRegulationDetailsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRegulationDetailsRequest", getRegulationDetailsRequest);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetRegulationDetailsQuery(
          getRegulationDetailsRequest.regulationType,
          getRegulationDetailsRequest.regulationSubType,
          new ContractId(factoryAddress),
        ),
      );
    });

    it("should throw error if regulationType is invalid", async () => {
      getRegulationDetailsRequest = new GetRegulationDetailsRequest({
        ...GetRegulationDetailsRequestFixture.create(),
        regulationType: 100,
      });

      await expect(Factory.getRegulationDetails(getRegulationDetailsRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if regulationSubType is invalid", async () => {
      getRegulationDetailsRequest = new GetRegulationDetailsRequest({
        ...GetRegulationDetailsRequestFixture.create(),
        regulationSubType: 100,
      });

      await expect(Factory.getRegulationDetails(getRegulationDetailsRequest)).rejects.toThrow(ValidationError);
    });
  });
});
