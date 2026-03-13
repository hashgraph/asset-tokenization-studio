// SPDX-License-Identifier: Apache-2.0

import { UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import {
  DividendForViewModel,
  DividendViewModel,
  GetDividendHoldersRequest,
  GetDividendForRequest,
  GetDividendRequest,
  GetTotalDividendHoldersRequest,
  SetDividendRequest,
  DividendAmountForViewModel,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_SECURITY_DIVIDENDS_FOR = (securityId: string, dividendId: number, targetId: string) =>
  `GET_SECURITY_DIVIDENDS_${securityId}_${dividendId}_${targetId}`;

export const GET_SECURITY_DIVIDENDS = (securityId: string, dividendId: number) =>
  `GET_SECURITY_DIVIDENDS_${securityId}_${dividendId}`;

export const GET_SECURITY_DIVIDENDS_HOLDERS = (securityId: string, dividendId: number) =>
  `GET_SECURITY_DIVIDENDS_HOLDERS_${securityId}_${dividendId}`;

export const GET_SECURITY_DIVIDENDS_TOTAL_HOLDERS = (securityId: string, dividendId: number) =>
  `GET_SECURITY_DIVIDENDS_TOTAL_HOLDERS_${securityId}_${dividendId}`;

export const GET_SECURITY_DIVIDENDS_AMOUNT_FOR = (securityId: string, dividendId: number, targetId: string) =>
  `GET_SECURITY_DIVIDENDS_AMOUNT_FOR_${securityId}_${dividendId}_${targetId}`;

export const useDividends = () => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "details.dividends" });

  return useMutation((setDividendRequest: SetDividendRequest) => SDKService.setDividend(setDividendRequest), {
    onSuccess: (data) => {
      console.log("SDK message --> Dividend creation success: ", data);

      if (!data) return;

      toast.show({
        duration: 3000,
        title: t("messages.succes"),
        description: t("messages.creationSuccessful"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Dividend creation error: ", error);
      toast.show({
        duration: 3000,
        title: t("messages.error"),
        description: t("messages.creationFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useGetDividendFor = <TError, TData = DividendForViewModel>(
  params: GetDividendForRequest,
  options: UseQueryOptions<DividendForViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_DIVIDENDS_FOR(params.securityId, params.dividendId, params.targetId)],
    () => SDKService.getDividendFor(params),
    options,
  );
};

export const useGetDividend = <TError, TData = DividendViewModel>(
  params: GetDividendRequest,
  options: UseQueryOptions<DividendViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_DIVIDENDS(params.securityId, params.dividendId)],
    () => SDKService.getDividend(params),
    options,
  );
};

export const useGetDividendHolders = <TError, TData = string[]>(
  params: GetDividendHoldersRequest,
  options: UseQueryOptions<string[], TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_DIVIDENDS_HOLDERS(params.securityId, params.dividendId)],
    () => SDKService.getDividendHolders(params),
    options,
  );
};

export const useGetDividendHoldersTotal = <TError, TData = number>(
  params: GetTotalDividendHoldersRequest,
  options: UseQueryOptions<number, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_DIVIDENDS_TOTAL_HOLDERS(params.securityId, params.dividendId)],
    () => SDKService.getTotalDividendHolders(params),
    options,
  );
};

export const useGetDividendsAmountFor = <TError, TData = DividendAmountForViewModel>(
  params: GetDividendForRequest,
  options: UseQueryOptions<DividendAmountForViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_DIVIDENDS_AMOUNT_FOR(params.securityId, params.dividendId, params.targetId)],
    () => SDKService.getDividendAmountFor(params),
    options,
  );
};
