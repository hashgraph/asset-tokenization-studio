// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import LogService from "@service/log/LogService";
import GetInterestRateRequest from "@port/in/request/interestRates/GetInterestRateRequest";
import InterestRateViewModel from "@port/in/response/interestRates/InterestRateViewModel";
import ImpactDataViewModel from "@port/in/response/interestRates/ImpactDataViewModel";
import GetImpactDataRequest from "@port/in/request/kpiLinkedRate/GetImpactDataRequest";
import {
  GetInterestRateQuery,
  GetInterestRateQueryResponse,
} from "@query/interestRates/getInterestRate/GetInterestRateQuery";
import { GetImpactDataQuery, GetImpactDataQueryResponse } from "@query/interestRates/getImpactData/GetImpactDataQuery";
import KpiLinkedRate from "./KpiLinkedRate";

describe("KpiLinkedRate", () => {
  let queryBusMock: jest.Mocked<QueryBus>;

  let getInterestRateRequest: GetInterestRateRequest;
  let getImpactDataRequest: GetImpactDataRequest;

  let handleValidationSpy: jest.SpyInstance;

  const mockSecurityId = "0.0.123456";
  const mockMaxRate = "1000";
  const mockBaseRate = "500";
  const mockMinRate = "100";
  const mockStartPeriod = "1000";
  const mockStartRate = "600";
  const mockMissedPenalty = "50";
  const mockReportPeriod = "2000";
  const mockRateDecimals = 2;
  const mockMaxDeviationCap = "200";
  const mockBaseLine = "500";
  const mockMaxDeviationFloor = "300";
  const mockImpactDataDecimals = 1;
  const mockAdjustmentPrecision = "3";

  beforeEach(() => {
    queryBusMock = createMock<QueryBus>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (KpiLinkedRate as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("getInterestRate", () => {
    beforeEach(() => {
      getInterestRateRequest = new GetInterestRateRequest({ securityId: mockSecurityId });
    });

    it("should get interest rate successfully", async () => {
      const expectedResponse = new GetInterestRateQueryResponse(
        mockMaxRate,
        mockBaseRate,
        mockMinRate,
        mockStartPeriod,
        mockStartRate,
        mockMissedPenalty,
        mockReportPeriod,
        mockRateDecimals,
      );
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await KpiLinkedRate.getInterestRate(getInterestRateRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetInterestRateRequest", getInterestRateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetInterestRateQuery(getInterestRateRequest.securityId));

      const expectedViewModel: InterestRateViewModel = {
        maxRate: mockMaxRate,
        baseRate: mockBaseRate,
        minRate: mockMinRate,
        startPeriod: mockStartPeriod,
        startRate: mockStartRate,
        missedPenalty: mockMissedPenalty,
        reportPeriod: mockReportPeriod,
        rateDecimals: mockRateDecimals,
      };
      expect(result).toEqual(expectedViewModel);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(KpiLinkedRate.getInterestRate(getInterestRateRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetInterestRateRequest", getInterestRateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetInterestRateQuery(getInterestRateRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      getInterestRateRequest = new GetInterestRateRequest({
        securityId: "",
      });

      await expect(KpiLinkedRate.getInterestRate(getInterestRateRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getImpactData", () => {
    beforeEach(() => {
      getImpactDataRequest = new GetImpactDataRequest({ securityId: mockSecurityId });
    });

    it("should get impact data successfully", async () => {
      const expectedResponse = new GetImpactDataQueryResponse(
        mockMaxDeviationCap,
        mockBaseLine,
        mockMaxDeviationFloor,
        mockImpactDataDecimals,
        mockAdjustmentPrecision,
      );
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await KpiLinkedRate.getImpactData(getImpactDataRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetImpactDataRequest", getImpactDataRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetImpactDataQuery(getImpactDataRequest.securityId));

      const expectedViewModel: ImpactDataViewModel = {
        maxDeviationCap: mockMaxDeviationCap,
        baseLine: mockBaseLine,
        maxDeviationFloor: mockMaxDeviationFloor,
        impactDataDecimals: mockImpactDataDecimals,
        adjustmentPrecision: mockAdjustmentPrecision,
      };
      expect(result).toEqual(expectedViewModel);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(KpiLinkedRate.getImpactData(getImpactDataRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetImpactDataRequest", getImpactDataRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetImpactDataQuery(getImpactDataRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      getImpactDataRequest = new GetImpactDataRequest({
        securityId: "",
      });

      await expect(KpiLinkedRate.getImpactData(getImpactDataRequest)).rejects.toThrow(ValidationError);
    });
  });
});
