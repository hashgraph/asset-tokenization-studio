import { UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "@iob/io-bricks-ui/Overlay/Toast";
import { useTranslation } from "react-i18next";
import {
  CouponForViewModel,
  CouponViewModel,
  GetAllCouponsRequest,
  GetCouponForRequest,
  GetCouponRequest,
  SetCouponRequest,
} from "@iob/securitytoken-sdk";

export const GET_SECURITY_COUPONS_FOR = (
  securityId: string,
  couponId: number,
  targetId: string,
) => `GET_SECURITY_COUPONS_FOR_${securityId}_${couponId}_${targetId}`;

export const GET_SECURITY_COUPONS = (securityId: string, couponId: number) =>
  `GET_SECURITY_COUPONS_${securityId}_${couponId}`;

export const GET_SECURITY_ALL_COUPONS = (securityId: string) =>
  `GET_SECURITY_ALL_COUPONS_${securityId}`;

export const useCoupons = () => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "details.coupons" });

  return useMutation(
    (setCouponRequest: SetCouponRequest) =>
      SDKService.setCoupon(setCouponRequest),
    {
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
    },
  );
};

export const useGetCouponsFor = <TError, TData = CouponForViewModel>(
  params: GetCouponForRequest,
  options: UseQueryOptions<CouponForViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [
      GET_SECURITY_COUPONS_FOR(
        params.securityId,
        params.couponId,
        params.targetId,
      ),
    ],
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
  return useQuery(
    [GET_SECURITY_ALL_COUPONS(params.securityId)],
    () => SDKService.getAllCoupons(params),
    options,
  );
};
