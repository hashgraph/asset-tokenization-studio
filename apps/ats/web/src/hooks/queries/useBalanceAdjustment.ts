// SPDX-License-Identifier: Apache-2.0

import { UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import {
  ScheduledBalanceAdjustmentViewModel,
  GetScheduledBalanceAdjustmentRequest,
  SetScheduledBalanceAdjustmentRequest,
  GetAllScheduledBalanceAdjustmentsRequest,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_SECURITY_BALANCE_ADJUSTMENT_FOR = (
  securityId: string,
  balanceAdjustmentId: number,
  targetId: string,
) => `GET_SECURITY_BALANCE_ADJUSTMENT_${securityId}_${balanceAdjustmentId}_${targetId}`;

export const GET_SECURITY_BALANCE_ADJUSTMENT = (securityId: string, balanceAdjustmentId: number) =>
  `GET_SECURITY_BALANCE_ADJUSTMENT_${securityId}_${balanceAdjustmentId}`;

export const GET_SECURITY_ALL_BALANCE_ADJUSTMENT = (securityId: string) =>
  `GET_SECURITY_ALL_BALANCE_ADJUSTMENT_${securityId}`;

export const useBalanceAdjustment = () => {
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.balanceAdjustment",
  });

  return useMutation(
    (setScheduledBalanceAdjustmentRequest: SetScheduledBalanceAdjustmentRequest) =>
      SDKService.setScheduledBalanceAdjustmentRequest(setScheduledBalanceAdjustmentRequest),
    {
      onSuccess: (data) => {
        console.log("SDK message --> Scheduled balance adjustment success: ", data);

        if (!data) return;

        toast.show({
          duration: 3000,
          title: t("messages.success"),
          description: t("messages.creationSuccessful"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log("SDK message --> Scheduled balance adjustment creation error: ", error);
        toast.show({
          duration: 3000,
          title: t("messages.error"),
          description: t("messages.creationFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};

export const useGetAllBalanceAdjustments = <TError, TData = ScheduledBalanceAdjustmentViewModel[]>(
  params: GetAllScheduledBalanceAdjustmentsRequest,
  options?: UseQueryOptions<ScheduledBalanceAdjustmentViewModel[], TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_ALL_BALANCE_ADJUSTMENT(params.securityId)],
    () => SDKService.getAllScheduledBalanceAdjustmentRequest(params),
    options,
  );
};

export const useGetBalanceAdjustments = <TError, TData = ScheduledBalanceAdjustmentViewModel>(
  params: GetScheduledBalanceAdjustmentRequest,
  options: UseQueryOptions<ScheduledBalanceAdjustmentViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_BALANCE_ADJUSTMENT(params.securityId, params.balanceAdjustmentId)],
    () => SDKService.getScheduledBalanceAdjustmentRequest(params),
    options,
  );
};
