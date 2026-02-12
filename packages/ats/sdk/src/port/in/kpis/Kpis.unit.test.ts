// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import LogService from "@service/log/LogService";
import { BigNumber } from "ethers";
import GetLatestKpiDataRequest from "../request/kpis/GetLatestKpiDataRequest";
import GetMinDateRequest from "../request/kpis/GetMinDateRequest";
import IsCheckPointDateRequest from "../request/kpis/IsCheckPointDateRequest";
import {
  GetLatestKpiDataQuery,
  GetLatestKpiDataQueryResponse,
} from "@query/interestRates/getLatestKpiData/GetLatestKpiDataQuery";
import { GetMinDateQuery, GetMinDateQueryResponse } from "@query/kpis/getMinDate/GetMinDateQuery";
import {
  IsCheckPointDateQuery,
  IsCheckPointDateQueryResponse,
} from "@query/kpis/isCheckPointDate/IsCheckPointDateQuery";
import Kpis from "./Kpis";

describe("Kpis", () => {
  let queryBusMock: jest.Mocked<QueryBus>;

  let getLatestKpiDataRequest: GetLatestKpiDataRequest;
  let getMinDateRequest: GetMinDateRequest;
  let isCheckPointDateRequest: IsCheckPointDateRequest;

  let handleValidationSpy: jest.SpyInstance;

  const mockSecurityId = "0.0.123456";
  const mockFrom = "1000";
  const mockTo = "2000";
  const mockKpi = "test-kpi";
  const mockDate = 1234567890;
  const mockProject = "0x1234567890123456789012345678901234567890";
  const mockValue = "12345";
  const mockExists = true;
  const mockMinDate = 1000000;
  const mockIsCheckPoint = true;

  beforeEach(() => {
    queryBusMock = createMock<QueryBus>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (Kpis as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("getLatestKpiData", () => {
    beforeEach(() => {
      getLatestKpiDataRequest = new GetLatestKpiDataRequest({
        securityId: mockSecurityId,
        from: mockFrom,
        to: mockTo,
        kpi: mockKpi,
      });
    });

    it("should get latest kpi data successfully", async () => {
      const expectedResponse = new GetLatestKpiDataQueryResponse(mockValue, mockExists);
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kpis.getLatestKpiData(getLatestKpiDataRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLatestKpiDataRequest", getLatestKpiDataRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetLatestKpiDataQuery(
          getLatestKpiDataRequest.securityId,
          BigNumber.from(getLatestKpiDataRequest.from),
          BigNumber.from(getLatestKpiDataRequest.to),
          getLatestKpiDataRequest.kpi,
        ),
      );
      expect(result).toEqual({ value: mockValue, exists: mockExists });
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Kpis.getLatestKpiData(getLatestKpiDataRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLatestKpiDataRequest", getLatestKpiDataRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetLatestKpiDataQuery(
          getLatestKpiDataRequest.securityId,
          BigNumber.from(getLatestKpiDataRequest.from),
          BigNumber.from(getLatestKpiDataRequest.to),
          getLatestKpiDataRequest.kpi,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getLatestKpiDataRequest = new GetLatestKpiDataRequest({
        securityId: "",
        from: mockFrom,
        to: mockTo,
        kpi: mockKpi,
      });

      await expect(Kpis.getLatestKpiData(getLatestKpiDataRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if kpi is invalid", async () => {
      getLatestKpiDataRequest = new GetLatestKpiDataRequest({
        securityId: mockSecurityId,
        from: mockFrom,
        to: mockTo,
        kpi: "",
      });

      await expect(Kpis.getLatestKpiData(getLatestKpiDataRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getMinDate", () => {
    beforeEach(() => {
      getMinDateRequest = new GetMinDateRequest({ securityId: mockSecurityId });
    });

    it("should get min date successfully", async () => {
      const expectedResponse = new GetMinDateQueryResponse(mockMinDate);
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kpis.getMinDate(getMinDateRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetMinDateRequest", getMinDateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetMinDateQuery(getMinDateRequest.securityId));
      expect(result).toEqual(mockMinDate);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Kpis.getMinDate(getMinDateRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetMinDateRequest", getMinDateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetMinDateQuery(getMinDateRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      getMinDateRequest = new GetMinDateRequest({
        securityId: "",
      });

      await expect(Kpis.getMinDate(getMinDateRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("isCheckPointDate", () => {
    beforeEach(() => {
      isCheckPointDateRequest = new IsCheckPointDateRequest({
        securityId: mockSecurityId,
        date: mockDate,
        project: mockProject,
      });
    });

    it("should check if date is checkpoint successfully", async () => {
      const expectedResponse = new IsCheckPointDateQueryResponse(mockIsCheckPoint);
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Kpis.isCheckPointDate(isCheckPointDateRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("IsCheckPointDateRequest", isCheckPointDateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsCheckPointDateQuery(
          isCheckPointDateRequest.securityId,
          BigNumber.from(isCheckPointDateRequest.date),
          isCheckPointDateRequest.project,
        ),
      );
      expect(result).toEqual(mockIsCheckPoint);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Kpis.isCheckPointDate(isCheckPointDateRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("IsCheckPointDateRequest", isCheckPointDateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsCheckPointDateQuery(
          isCheckPointDateRequest.securityId,
          BigNumber.from(isCheckPointDateRequest.date),
          isCheckPointDateRequest.project,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      isCheckPointDateRequest = new IsCheckPointDateRequest({
        securityId: "",
        date: mockDate,
        project: mockProject,
      });

      await expect(Kpis.isCheckPointDate(isCheckPointDateRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if project is invalid", async () => {
      isCheckPointDateRequest = new IsCheckPointDateRequest({
        securityId: mockSecurityId,
        date: mockDate,
        project: "",
      });

      await expect(Kpis.isCheckPointDate(isCheckPointDateRequest)).rejects.toThrow(ValidationError);
    });
  });
});
