// SPDX-License-Identifier: Apache-2.0

import { UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import {
  CouponForViewModel,
  CouponViewModel,
  GetAllCouponsRequest,
  GetCouponForRequest,
  GetCouponHoldersRequest,
  GetCouponRequest,
  GetTotalCouponHoldersRequest,
  SetCouponRequest,
  CouponAmountForViewModel,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_SECURITY_COUPONS_FOR = (securityId: string, couponId: number, targetId: string) =>
  `GET_SECURITY_COUPONS_FOR_${securityId}_${couponId}_${targetId}`;

export const GET_SECURITY_COUPONS = (securityId: string, couponId: number) =>
  `GET_SECURITY_COUPONS_${securityId}_${couponId}`;

export const GET_SECURITY_ALL_COUPONS = (securityId: string) => `GET_SECURITY_ALL_COUPONS_${securityId}`;

export const GET_SECURITY_COUPONS_HOLDERS = (securityId: string, couponId: number) =>
  `GET_SECURITY_COUPONS_HOLDERS_${securityId}_${couponId}`;

export const GET_SECURITY_COUPONS_TOTAL_HOLDERS = (securityId: string, couponId: number) =>
  `GET_SECURITY_COUPONS_TOTAL_HOLDERS_${securityId}_${couponId}`;

export const GET_SECURITY_AMOUNT_COUPONS_FOR = (securityId: string, couponId: number, targetId: string) =>
  `GET_SECURITY_AMOUNT_COUPONS_FOR_${securityId}_${couponId}_${targetId}`;

export const useCoupons = () => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "details.coupons" });

  return useMutation((setCouponRequest: SetCouponRequest) => SDKService.setCoupon(setCouponRequest), {
    onSuccess: (data) => {
      console.log("SDK message --> Coupon creation success: ", data);

      if (!data) return;

      toast.show({
        title: t("messages.success"),
        description: t("messages.creationSuccessful"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Coupon creation error: ", error);
      toast.show({
        title: t("messages.error"),
        description: t("messages.creationFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useGetCouponsFor = <TError, TData = CouponForViewModel>(
  params: GetCouponForRequest,
  options: UseQueryOptions<CouponForViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_COUPONS_FOR(params.securityId, params.couponId, params.targetId)],
    () => SDKService.getCouponFor(params),
    options,
  );
};

export const useGetCoupons = <TError, TData = CouponViewModel>(
  params: GetCouponRequest,
  options: UseQueryOptions<CouponViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_COUPONS(params.securityId, params.couponId)],
    () => SDKService.getCoupon(params),
    options,
  );
};

export const useGetAllCoupons = <TError, TData = CouponViewModel[]>(
  params: GetAllCouponsRequest,
  options: UseQueryOptions<CouponViewModel[], TError, TData, [string]> = {},
) => {
  return useQuery([GET_SECURITY_ALL_COUPONS(params.securityId)], () => SDKService.getAllCoupons(params), options);
};

export const useGetCouponsHolders = <TError, TData = string[]>(
  params: GetCouponHoldersRequest,
  options: UseQueryOptions<string[], TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_COUPONS_HOLDERS(params.securityId, params.couponId)],
    () => SDKService.getCouponHolders(params),
    options,
  );
};

export const useGetCouponsTotalHolders = <TError, TData = number>(
  params: GetTotalCouponHoldersRequest,
  options: UseQueryOptions<number, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_COUPONS_TOTAL_HOLDERS(params.securityId, params.couponId)],
    () => SDKService.getTotalCouponHolders(params),
    options,
  );
};

export const useGetCouponsAmountFor = <TError, TData = CouponAmountForViewModel>(
  params: GetCouponForRequest,
  options: UseQueryOptions<CouponAmountForViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_AMOUNT_COUPONS_FOR(params.securityId, params.couponId, params.targetId)],
    () => SDKService.getCouponAmountFor(params),
    options,
  );
};
