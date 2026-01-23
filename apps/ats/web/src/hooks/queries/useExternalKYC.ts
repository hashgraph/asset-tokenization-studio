// SPDX-License-Identifier: Apache-2.0

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  GetExternalKycListsCountRequest,
  GetExternalKycListsMembersRequest,
  GetKycStatusMockRequest,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_EXTERNAL_KYC_STATUS = (securityId: string) => `GET_EXTERNAL_KYC_COUNT_${securityId}`;

export const GET_EXTERNAL_KYC_COUNT = (securityId: string) => `GET_EXTERNAL_KYC_COUNT_${securityId}`;

export const GET_EXTERNAL_KYC_MEMBERS = (securityId: string, start: number, end: number) =>
  `GET_EXTERNAL_KYC_MEMBERS_${securityId}_${start}_${end}`;

export const useGetKycStatusMock = <TError, TData = number>(
  request: GetKycStatusMockRequest,
  options?: UseQueryOptions<number, TError, TData, [string]>,
) => {
  return useQuery([GET_EXTERNAL_KYC_COUNT(request.contractId)], () => SDKService.getKycStatusMock(request), options);
};

export const useGetExternalKycListsCount = <TError, TData = number>(
  request: GetExternalKycListsCountRequest,
  options?: UseQueryOptions<number, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_EXTERNAL_KYC_COUNT(request.securityId)],
    () => SDKService.getExternalKycListsCount(request),
    options,
  );
};

export const useGetExternalKycListsMembers = <TError, TData = string[]>(
  params: GetExternalKycListsMembersRequest,
  options?: UseQueryOptions<string[], TError, TData, [string]>,
) => {
  return useQuery(
    [GET_EXTERNAL_KYC_MEMBERS(params.securityId, params.start, params.end)],
    () => SDKService.getExternalKycListsMembers(params),
    options,
  );
};

export const useGetExternalKyc = (securityId: string, start: number = 0) => {
  const countQuery = useGetExternalKycListsCount(new GetExternalKycListsCountRequest({ securityId }), {
    retry: false,
  });

  const membersQuery = useGetExternalKycListsMembers(
    new GetExternalKycListsMembersRequest({
      securityId,
      start,
      end: countQuery.data ?? 0,
    }),
    { retry: false },
  );

  const isLoading = membersQuery.isLoading;
  const isError = membersQuery.isError;

  const data = (membersQuery.data ?? []).map((memberId) => ({
    address: memberId,
    isError,
    isLoading,
  }));

  return {
    isLoading,
    isError,
    data,
  };
};
