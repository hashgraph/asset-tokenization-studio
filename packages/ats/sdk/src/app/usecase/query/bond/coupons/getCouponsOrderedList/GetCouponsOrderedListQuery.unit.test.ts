// SPDX-License-Identifier: Apache-2.0

import { GetCouponsOrderedListQuery, GetCouponsOrderedListQueryResponse } from "./GetCouponsOrderedListQuery";

describe("GetCouponsOrderedListQuery", () => {
  it("should create query with correct parameters", () => {
    const securityId = "0.0.12345";
    const pageIndex = 0;
    const pageLength = 10;

    const query = new GetCouponsOrderedListQuery(securityId, pageIndex, pageLength);

    expect(query.securityId).toBe(securityId);
    expect(query.pageIndex).toBe(pageIndex);
    expect(query.pageLength).toBe(pageLength);
  });

  it("should create response with correct payload", () => {
    const couponIds = [1, 2, 3, 4, 5];
    const response = new GetCouponsOrderedListQueryResponse(couponIds);

    expect(response.payload).toEqual(couponIds);
  });

  it("should handle empty coupon list", () => {
    const emptyCouponIds: number[] = [];
    const response = new GetCouponsOrderedListQueryResponse(emptyCouponIds);

    expect(response.payload).toEqual([]);
    expect(response.payload).toHaveLength(0);
  });

  it("should handle single coupon", () => {
    const singleCouponId = [42];
    const response = new GetCouponsOrderedListQueryResponse(singleCouponId);

    expect(response.payload).toEqual([42]);
    expect(response.payload).toHaveLength(1);
  });

  it("should handle large page length", () => {
    const securityId = "0.0.12345";
    const pageIndex = 5;
    const pageLength = 100;

    const query = new GetCouponsOrderedListQuery(securityId, pageIndex, pageLength);

    expect(query.securityId).toBe(securityId);
    expect(query.pageIndex).toBe(pageIndex);
    expect(query.pageLength).toBe(pageLength);
  });
});
