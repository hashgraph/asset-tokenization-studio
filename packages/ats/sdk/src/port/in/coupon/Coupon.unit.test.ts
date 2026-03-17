// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import LogService from "@service/log/LogService";
import { CancelCouponCommand } from "@command/bond/coupon/cancel/CancelCouponCommand";
import { SetCouponCommand } from "@command/bond/coupon/set/SetCouponCommand";
import { GetCouponForQuery } from "@query/bond/coupons/getCouponFor/GetCouponForQuery";
import { GetCouponAmountForQuery } from "@query/bond/coupons/getCouponAmountFor/GetCouponAmountForQuery";
import { GetCouponQuery } from "@query/bond/coupons/getCoupon/GetCouponQuery";
import { GetCouponCountQuery } from "@query/bond/coupons/getCouponCount/GetCouponCountQuery";
import { GetCouponsOrderedListQuery } from "@query/bond/coupons/getCouponsOrderedList/GetCouponsOrderedListQuery";
import { GetCouponsOrderedListTotalQuery } from "@query/bond/coupons/getCouponsOrderedListTotal/GetCouponsOrderedListTotalQuery";
import { GetCouponHoldersQuery } from "@query/bond/coupons/getCouponHolders/GetCouponHoldersQuery";
import { GetTotalCouponHoldersQuery } from "@query/bond/coupons/getTotalCouponHolders/GetTotalCouponHoldersQuery";
import { GetCouponFromOrderedListAtQuery } from "@query/bond/coupons/getCouponFromOrderedListAt/GetCouponFromOrderedListAtQuery";
import CancelCouponRequest from "../request/bond/CancelCouponRequest";
import SetCouponRequest from "../request/bond/SetCouponRequest";
import GetCouponForRequest from "../request/bond/GetCouponForRequest";
import GetCouponRequest from "../request/bond/GetCouponRequest";
import GetAllCouponsRequest from "../request/bond/GetAllCouponsRequest";
import GetCouponsOrderedListRequest from "../request/bond/GetCouponsOrderedListRequest";
import GetCouponsOrderedListTotalRequest from "../request/bond/GetCouponsOrderedListTotalRequest";
import GetCouponFromOrderedListAtRequest from "../request/bond/GetCouponFromOrderedListAtRequest";
import { GetCouponHoldersRequest, GetTotalCouponHoldersRequest } from "../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import {
  CancelCouponRequestFixture,
  CouponFixture,
  GetAllCouponsRequestFixture,
  GetCouponForRequestFixture,
  GetCouponHoldersQueryFixture,
  GetCouponRequestFixture,
  GetCouponsOrderedListRequestFixture,
  GetTotalCouponHoldersRequestFixture,
  SetCouponRequestFixture,
} from "@test/fixtures/bond/BondFixture";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import { CastRateStatus } from "@domain/context/bond/RateStatus";
import { faker } from "@faker-js/faker/.";
import CouponToken from "./Coupon";

describe("Coupon", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;

  let setCouponRequest: SetCouponRequest;
  let cancelCouponRequest: CancelCouponRequest;
  let getCouponForRequest: GetCouponForRequest;
  let getCouponRequest: GetCouponRequest;
  let getAllCouponsRequest: GetAllCouponsRequest;
  let getCouponsOrderedListRequest: GetCouponsOrderedListRequest;
  let getCouponHoldersRequest: GetCouponHoldersRequest;
  let getTotalCouponHoldersRequest: GetTotalCouponHoldersRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    getAllCouponsRequest = new GetAllCouponsRequest(GetAllCouponsRequestFixture.create());
    getCouponsOrderedListRequest = new GetCouponsOrderedListRequest(GetCouponsOrderedListRequestFixture.create());
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (CouponToken as any).commandBus = commandBusMock;
    (CouponToken as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("setCoupon", () => {
    setCouponRequest = new SetCouponRequest(SetCouponRequestFixture.create());
    it("should set coupon successfully", async () => {
      const expectedResponse = {
        payload: 1,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await CouponToken.setCoupon(setCouponRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetCouponRequest", setCouponRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetCouponCommand(
          setCouponRequest.securityId,
          setCouponRequest.recordTimestamp,
          setCouponRequest.executionTimestamp,
          setCouponRequest.rate,
          setCouponRequest.startTimestamp,
          setCouponRequest.endTimestamp,
          setCouponRequest.fixingTimestamp,
          CastRateStatus.fromNumber(setCouponRequest.rateStatus),
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.setCoupon(setCouponRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetCouponRequest", setCouponRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetCouponCommand(
          setCouponRequest.securityId,
          setCouponRequest.recordTimestamp,
          setCouponRequest.executionTimestamp,
          setCouponRequest.rate,
          setCouponRequest.startTimestamp,
          setCouponRequest.endTimestamp,
          setCouponRequest.fixingTimestamp,
          CastRateStatus.fromNumber(setCouponRequest.rateStatus),
        ),
      );
    });

    it("should throw error if recordTimestamp is invalid", async () => {
      setCouponRequest = new SetCouponRequest({
        ...SetCouponRequestFixture.create(),
        recordTimestamp: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
      });

      await expect(CouponToken.setCoupon(setCouponRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if executionTimestamp is invalid", async () => {
      const time = faker.date.past().getTime();
      setCouponRequest = new SetCouponRequest({
        ...SetCouponRequestFixture.create(),
        recordTimestamp: time.toString(),
        executionTimestamp: (time - 10).toString(),
      });

      await expect(CouponToken.setCoupon(setCouponRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if securityId is invalid", async () => {
      setCouponRequest = new SetCouponRequest({
        ...SetCouponRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(CouponToken.setCoupon(setCouponRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if rate is invalid", async () => {
      setCouponRequest = new SetCouponRequest({
        ...SetCouponRequestFixture.create(),
        rate: "invalid",
      });

      await expect(CouponToken.setCoupon(setCouponRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("cancelCoupon", () => {
    beforeEach(() => {
      cancelCouponRequest = new CancelCouponRequest(CancelCouponRequestFixture.create());
    });

    it("should cancel coupon successfully", async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await CouponToken.cancelCoupon(cancelCouponRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("CancelCouponRequest", cancelCouponRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CancelCouponCommand(cancelCouponRequest.securityId, cancelCouponRequest.couponId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.cancelCoupon(cancelCouponRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("CancelCouponRequest", cancelCouponRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CancelCouponCommand(cancelCouponRequest.securityId, cancelCouponRequest.couponId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      cancelCouponRequest = new CancelCouponRequest({
        ...CancelCouponRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(CouponToken.cancelCoupon(cancelCouponRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getCouponFor", () => {
    beforeEach(() => {
      getCouponForRequest = new GetCouponForRequest(GetCouponForRequestFixture.create());
    });

    it("should get coupon for successfully", async () => {
      const coupon = CouponFixture.create();
      const expectedResponse = {
        tokenBalance: BigInt(1000),
        nominalValue: BigInt(500),
        decimals: 2,
        recordDateReached: false,
        coupon: coupon,
        couponAmount: {
          numerator: "10",
          denominator: "4",
          recordDateReached: true,
        },
        isDisabled: false,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await CouponToken.getCouponFor(getCouponForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponForRequest", getCouponForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponForQuery(
          getCouponForRequest.targetId,
          getCouponForRequest.securityId,
          getCouponForRequest.couponId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          tokenBalance: expectedResponse.tokenBalance.toString(),
          nominalValue: expectedResponse.nominalValue.toString(),
          decimals: expectedResponse.decimals.toString(),
          recordDateReached: expectedResponse.recordDateReached,
          coupon: expect.objectContaining({
            recordDate: new Date(coupon.recordTimeStamp * ONE_THOUSAND),
            executionDate: new Date(coupon.executionTimeStamp * ONE_THOUSAND),
            rate: coupon.rate.toString(),
          }),
          couponAmount: expect.objectContaining({
            numerator: expectedResponse.couponAmount.numerator,
            denominator: expectedResponse.couponAmount.denominator,
            recordDateReached: expectedResponse.couponAmount.recordDateReached,
          }),
          isDisabled: expectedResponse.isDisabled,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.getCouponFor(getCouponForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponForRequest", getCouponForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponForQuery(
          getCouponForRequest.targetId,
          getCouponForRequest.securityId,
          getCouponForRequest.couponId,
        ),
      );
    });

    it("should throw error if targetId is invalid", async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        targetId: "invalid",
      });

      await expect(CouponToken.getCouponFor(getCouponForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if securityId is invalid", async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(CouponToken.getCouponFor(getCouponForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if couponId is invalid", async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        couponId: 0,
      });

      await expect(CouponToken.getCouponFor(getCouponForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getCouponAmountFor", () => {
    beforeEach(() => {
      getCouponForRequest = new GetCouponForRequest(GetCouponForRequestFixture.create());
    });

    it("should get coupon amount for successfully", async () => {
      const expectedResponse = {
        numerator: "10",
        denominator: "4",
        recordDateReached: true,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await CouponToken.getCouponAmountFor(getCouponForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponForRequest", getCouponForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponAmountForQuery(
          getCouponForRequest.targetId,
          getCouponForRequest.securityId,
          getCouponForRequest.couponId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          numerator: expectedResponse.numerator,
          denominator: expectedResponse.denominator,
          recordDateReached: expectedResponse.recordDateReached,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.getCouponAmountFor(getCouponForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponForRequest", getCouponForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponAmountForQuery(
          getCouponForRequest.targetId,
          getCouponForRequest.securityId,
          getCouponForRequest.couponId,
        ),
      );
    });

    it("should throw error if targetId is invalid", async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        targetId: "invalid",
      });

      await expect(CouponToken.getCouponAmountFor(getCouponForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if securityId is invalid", async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(CouponToken.getCouponAmountFor(getCouponForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if couponId is invalid", async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        couponId: 0,
      });

      await expect(CouponToken.getCouponAmountFor(getCouponForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getCoupon", () => {
    getCouponRequest = new GetCouponRequest(GetCouponRequestFixture.create());

    it("should get coupon successfully", async () => {
      const expectedResponse = {
        coupon: CouponFixture.create(),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await CouponToken.getCoupon(getCouponRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponRequest", getCouponRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponQuery(getCouponRequest.securityId, getCouponRequest.couponId),
      );

      expect(result).toEqual(
        expect.objectContaining({
          couponId: getCouponRequest.couponId,
          recordDate: new Date(expectedResponse.coupon.recordTimeStamp * ONE_THOUSAND),
          executionDate: new Date(expectedResponse.coupon.executionTimeStamp * ONE_THOUSAND),
          rate: expectedResponse.coupon.rate.toString(),
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.getCoupon(getCouponRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponRequest", getCouponRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponQuery(getCouponRequest.securityId, getCouponRequest.couponId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getCouponRequest = new GetCouponRequest({
        ...GetCouponRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(CouponToken.getCoupon(getCouponRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if couponId is invalid", async () => {
      getCouponRequest = new GetCouponRequest({
        ...GetCouponRequestFixture.create(),
        couponId: 0,
      });

      await expect(CouponToken.getCoupon(getCouponRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getAllCoupons", () => {
    getAllCouponsRequest = new GetAllCouponsRequest(GetAllCouponsRequestFixture.create());

    it("should get all coupons successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      const expectedResponse2 = {
        coupon: CouponFixture.create(),
      };

      queryBusMock.execute.mockResolvedValueOnce(expectedResponse).mockResolvedValueOnce(expectedResponse2);

      const result = await CouponToken.getAllCoupons(getAllCouponsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllCouponsRequest", getAllCouponsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(2);

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(1, new GetCouponCountQuery(getAllCouponsRequest.securityId));

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(2, new GetCouponQuery(getAllCouponsRequest.securityId, 1));

      expect(result).toEqual(
        expect.arrayContaining([
          {
            couponId: 1,
            recordDate: new Date(expectedResponse2.coupon.recordTimeStamp * ONE_THOUSAND),
            executionDate: new Date(expectedResponse2.coupon.executionTimeStamp * ONE_THOUSAND),
            rate: expectedResponse2.coupon.rate.toString(),
            rateDecimals: expectedResponse2.coupon.rateDecimals,
            startDate: new Date(expectedResponse2.coupon.startTimeStamp * ONE_THOUSAND),
            endDate: new Date(expectedResponse2.coupon.endTimeStamp * ONE_THOUSAND),
            fixingDate: new Date(expectedResponse2.coupon.fixingTimeStamp * ONE_THOUSAND),
            rateStatus: CastRateStatus.toNumber(expectedResponse2.coupon.rateStatus),
            isDisabled: expectedResponse2.coupon.isDisabled,
          },
        ]),
      );
    });

    it("should return empty array if count is 0", async () => {
      const expectedResponse = {
        payload: 0,
      };
      queryBusMock.execute.mockResolvedValueOnce(expectedResponse);

      const result = await CouponToken.getAllCoupons(getAllCouponsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllCouponsRequest", getAllCouponsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetCouponCountQuery(getAllCouponsRequest.securityId));

      expect(result).toStrictEqual([]);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.getAllCoupons(getAllCouponsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllCouponsRequest", getAllCouponsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetCouponCountQuery(getAllCouponsRequest.securityId));
    });
  });

  describe("getCouponsOrderedList", () => {
    it("should get coupons ordered list successfully", async () => {
      const expectedResponse = [1, 2, 3, 4, 5];

      queryBusMock.execute.mockResolvedValue({ payload: expectedResponse });

      const result = await CouponToken.getCouponsOrderedList(getCouponsOrderedListRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponsOrderedListRequest", getCouponsOrderedListRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponsOrderedListQuery(
          getCouponsOrderedListRequest.securityId,
          getCouponsOrderedListRequest.pageIndex,
          getCouponsOrderedListRequest.pageLength,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.getCouponsOrderedList(getCouponsOrderedListRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponsOrderedListRequest", getCouponsOrderedListRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponsOrderedListQuery(
          getCouponsOrderedListRequest.securityId,
          getCouponsOrderedListRequest.pageIndex,
          getCouponsOrderedListRequest.pageLength,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      const invalidRequest = new GetCouponsOrderedListRequest({
        securityId: "invalid",
        pageIndex: 0,
        pageLength: 10,
      });

      await expect(CouponToken.getCouponsOrderedList(invalidRequest)).rejects.toThrow(ValidationError);
    });

    it("should work with mocked query handler", async () => {
      const expectedResponse = [10, 20, 30];

      const mockHandler = {
        execute: jest.fn().mockResolvedValue({ payload: expectedResponse }),
      };

      queryBusMock.execute.mockImplementation((query) => {
        if (query instanceof GetCouponsOrderedListQuery) {
          return mockHandler.execute(query);
        }
        return Promise.resolve({});
      });

      const result = await CouponToken.getCouponsOrderedList(getCouponsOrderedListRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponsOrderedListRequest", getCouponsOrderedListRequest);
      expect(mockHandler.execute).toHaveBeenCalledWith(
        new GetCouponsOrderedListQuery(
          getCouponsOrderedListRequest.securityId,
          getCouponsOrderedListRequest.pageIndex,
          getCouponsOrderedListRequest.pageLength,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getCouponsOrderedListTotal", () => {
    it("should get coupons ordered list total successfully", async () => {
      const securityId = HederaIdPropsFixture.create().value;
      const request = new GetCouponsOrderedListTotalRequest({ securityId });

      queryBusMock.execute.mockResolvedValue({ payload: 5 });

      const result = await CouponToken.getCouponsOrderedListTotal(request);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetCouponsOrderedListTotalRequest", request);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetCouponsOrderedListTotalQuery(securityId));

      expect(result).toEqual(5);
    });

    it("should throw an error if query execution fails", async () => {
      const securityId = HederaIdPropsFixture.create().value;
      const request = new GetCouponsOrderedListTotalRequest({ securityId });
      const error = new Error("Query execution failed");

      queryBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.getCouponsOrderedListTotal(request)).rejects.toThrow("Query execution failed");
    });

    it("should throw error if securityId is invalid", async () => {
      const request = new GetCouponsOrderedListTotalRequest({ securityId: "invalid" });

      await expect(CouponToken.getCouponsOrderedListTotal(request)).rejects.toThrow(ValidationError);
    });
  });

  describe("getCouponHolders", () => {
    getCouponHoldersRequest = new GetCouponHoldersRequest(GetCouponHoldersQueryFixture.create());

    it("should get coupon holders successfully", async () => {
      const expectedResponse = {
        payload: [transactionId],
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await CouponToken.getCouponHolders(getCouponHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(GetCouponHoldersRequest.name, getCouponHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponHoldersQuery(
          getCouponHoldersRequest.securityId,
          getCouponHoldersRequest.couponId,
          getCouponHoldersRequest.start,
          getCouponHoldersRequest.end,
        ),
      );

      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.getCouponHolders(getCouponHoldersRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(GetCouponHoldersRequest.name, getCouponHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponHoldersQuery(
          getCouponHoldersRequest.securityId,
          getCouponHoldersRequest.couponId,
          getCouponHoldersRequest.start,
          getCouponHoldersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getCouponHoldersRequest = new GetCouponHoldersRequest({
        ...GetCouponHoldersQueryFixture.create(),
        securityId: "invalid",
      });

      await expect(CouponToken.getCouponHolders(getCouponHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if couponId is invalid", async () => {
      getCouponHoldersRequest = new GetCouponHoldersRequest({
        ...GetCouponHoldersQueryFixture.create(),
        couponId: -1,
      });

      await expect(CouponToken.getCouponHolders(getCouponHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if start is invalid", async () => {
      getCouponHoldersRequest = new GetCouponHoldersRequest({
        ...GetCouponHoldersQueryFixture.create(),
        start: -1,
      });

      await expect(CouponToken.getCouponHolders(getCouponHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if end is invalid", async () => {
      getCouponHoldersRequest = new GetCouponHoldersRequest({
        ...GetCouponHoldersQueryFixture.create(),
        end: -1,
      });

      await expect(CouponToken.getCouponHolders(getCouponHoldersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getTotalCouponHolders", () => {
    getTotalCouponHoldersRequest = new GetTotalCouponHoldersRequest(GetTotalCouponHoldersRequestFixture.create());

    it("should get total coupon holders successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await CouponToken.getTotalCouponHolders(getTotalCouponHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(GetTotalCouponHoldersRequest.name, getTotalCouponHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalCouponHoldersQuery(getTotalCouponHoldersRequest.securityId, getTotalCouponHoldersRequest.couponId),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.getTotalCouponHolders(getTotalCouponHoldersRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(GetTotalCouponHoldersRequest.name, getTotalCouponHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalCouponHoldersQuery(getTotalCouponHoldersRequest.securityId, getTotalCouponHoldersRequest.couponId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getTotalCouponHoldersRequest = new GetTotalCouponHoldersRequest({
        ...GetTotalCouponHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(CouponToken.getTotalCouponHolders(getTotalCouponHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if couponId is invalid", async () => {
      getTotalCouponHoldersRequest = new GetTotalCouponHoldersRequest({
        ...GetTotalCouponHoldersRequestFixture.create(),
        couponId: -1,
      });

      await expect(CouponToken.getTotalCouponHolders(getTotalCouponHoldersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getCouponFromOrderedListAt", () => {
    it("should get coupon from ordered list at position successfully", async () => {
      const securityId = HederaIdPropsFixture.create().value;
      const pos = 3;
      const request = new GetCouponFromOrderedListAtRequest({ securityId, pos });

      queryBusMock.execute.mockResolvedValue({ couponId: 7 });

      const result = await CouponToken.getCouponFromOrderedListAt(request);

      expect(handleValidationSpy).toHaveBeenCalledWith(GetCouponFromOrderedListAtRequest.name, request);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetCouponFromOrderedListAtQuery(securityId, pos));

      expect(result).toEqual(7);
    });

    it("should throw an error if query execution fails", async () => {
      const securityId = HederaIdPropsFixture.create().value;
      const request = new GetCouponFromOrderedListAtRequest({ securityId, pos: 1 });
      const error = new Error("Query execution failed");

      queryBusMock.execute.mockRejectedValue(error);

      await expect(CouponToken.getCouponFromOrderedListAt(request)).rejects.toThrow("Query execution failed");
    });

    it("should throw error if securityId is invalid", async () => {
      const request = new GetCouponFromOrderedListAtRequest({ securityId: "invalid", pos: 1 });

      await expect(CouponToken.getCouponFromOrderedListAt(request)).rejects.toThrow(ValidationError);
    });
  });
});
