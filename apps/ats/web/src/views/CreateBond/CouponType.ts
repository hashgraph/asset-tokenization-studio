// SPDX-License-Identifier: Apache-2.0

export enum CouponType {
  FIXED = "Fixed",
  CUSTOM = "Custom",
}

export function transformCouponType(value: number): CouponType {
  switch (value) {
    case 1:
      return CouponType.FIXED;
    case 2:
      return CouponType.CUSTOM;
    default:
      throw new Error(`Unknown value: ${value}`);
  }
}

export const CouponTypeOptions = [
  {
    value: 1,
    label: CouponType.FIXED,
  },
  {
    value: 2,
    label: CouponType.CUSTOM,
  },
];
