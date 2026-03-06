// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import LogService from "@service/log/LogService";
import ScheduledCouponListingCountRequest from "@port/in/request/scheduledTasks/ScheduledCouponListingCountRequest";
import GetScheduledCouponListingRequest from "@port/in/request/scheduledTasks/GetScheduledCouponListingRequest";
import {
  ScheduledCouponListingCountQuery,
  ScheduledCouponListingCountQueryResponse,
} from "../../../../app/usecase/query/scheduledTasks/scheduledCouponListingCount/ScheduledCouponListingCountQuery";
import {
  GetScheduledCouponListingQuery,
  GetScheduledCouponListingQueryResponse,
} from "../../../../app/usecase/query/scheduledCouponListing/getScheduledCouponListing/GetScheduledCouponListingQuery";
import ScheduledCouponListing from "./ScheduledCouponListing";

describe("ScheduledCouponListing", () => {
  let queryBusMock: jest.Mocked<QueryBus>;

  let scheduledCouponListingCountRequest: ScheduledCouponListingCountRequest;
  let getScheduledCouponListingRequest: GetScheduledCouponListingRequest;

  let handleValidationSpy: jest.SpyInstance;

  const mockSecurityId = "0.0.123456";
  const mockCount = 5;
  const mockScheduledCouponListing = { id: 1, date: "2023-01-01", amount: "100" };

  beforeEach(() => {
    queryBusMock = createMock<QueryBus>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (ScheduledCouponListing as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("scheduledCouponListingCount", () => {
    beforeEach(() => {
      scheduledCouponListingCountRequest = new ScheduledCouponListingCountRequest({ securityId: mockSecurityId });
    });

    it("should get scheduled coupon listing count successfully", async () => {
      const expectedResponse = new ScheduledCouponListingCountQueryResponse(mockCount);
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ScheduledCouponListing.scheduledCouponListingCount(scheduledCouponListingCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ScheduledCouponListingCountRequest",
        scheduledCouponListingCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new ScheduledCouponListingCountQuery(scheduledCouponListingCountRequest.securityId),
      );
      expect(result).toEqual(mockCount);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        ScheduledCouponListing.scheduledCouponListingCount(scheduledCouponListingCountRequest),
      ).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ScheduledCouponListingCountRequest",
        scheduledCouponListingCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new ScheduledCouponListingCountQuery(scheduledCouponListingCountRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      scheduledCouponListingCountRequest = new ScheduledCouponListingCountRequest({
        securityId: "",
      });

      await expect(
        ScheduledCouponListing.scheduledCouponListingCount(scheduledCouponListingCountRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getScheduledCouponListing", () => {
    beforeEach(() => {
      getScheduledCouponListingRequest = new GetScheduledCouponListingRequest({
        securityId: mockSecurityId,
        pageIndex: 0,
        pageLength: 10,
      });
    });

    it("should get scheduled coupon listing successfully", async () => {
      const expectedResponse = new GetScheduledCouponListingQueryResponse(mockScheduledCouponListing);
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await ScheduledCouponListing.getScheduledCouponListing(getScheduledCouponListingRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetScheduledCouponListingRequest",
        getScheduledCouponListingRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetScheduledCouponListingQuery(getScheduledCouponListingRequest.securityId, 0, 10),
      );
      expect(result).toEqual(mockScheduledCouponListing);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(ScheduledCouponListing.getScheduledCouponListing(getScheduledCouponListingRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetScheduledCouponListingRequest",
        getScheduledCouponListingRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetScheduledCouponListingQuery(getScheduledCouponListingRequest.securityId, 0, 10),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getScheduledCouponListingRequest = new GetScheduledCouponListingRequest({
        securityId: "",
        pageIndex: 0,
        pageLength: 10,
      });

      await expect(ScheduledCouponListing.getScheduledCouponListing(getScheduledCouponListingRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
