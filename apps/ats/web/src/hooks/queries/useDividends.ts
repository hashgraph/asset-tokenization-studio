//SPDX-License-Identifier: Apache-2.0

import { UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import {
  DividendsForViewModel,
  DividendsViewModel,
  GetDividendHoldersRequest,
  GetDividendsForRequest,
  GetDividendsRequest,
  GetTotalDividendHoldersRequest,
  SetDividendsRequest,
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

  return useMutation((setDividendsRequest: SetDividendsRequest) => SDKService.setDividends(setDividendsRequest), {
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

export const useGetDividendsFor = <TError, TData = DividendsForViewModel>(
  params: GetDividendsForRequest,
  options: UseQueryOptions<DividendsForViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_DIVIDENDS_FOR(params.securityId, params.dividendId, params.targetId)],
    () => SDKService.getDividendsFor(params),
    options,
  );
};

export const useGetDividends = <TError, TData = DividendsViewModel>(
  params: GetDividendsRequest,
  options: UseQueryOptions<DividendsViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_DIVIDENDS(params.securityId, params.dividendId)],
    () => SDKService.getDividends(params),
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
  params: GetDividendsForRequest,
  options: UseQueryOptions<DividendAmountForViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_DIVIDENDS_AMOUNT_FOR(params.securityId, params.dividendId, params.targetId)],
    () => SDKService.getDividendAmountFor(params),
    options,
  );
};
