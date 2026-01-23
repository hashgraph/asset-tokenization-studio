// SPDX-License-Identifier: Apache-2.0

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  GetExternalControlListsCountRequest,
  GetExternalControlListsMembersRequest,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_EXTERNAL_CONTROL_LIST_COUNT = (securityId: string) => `GET_EXTERNAL_CONTROL_LIST_COUNT_${securityId}`;

export const GET_EXTERNAL_CONTROLS_MEMBERS = (securityId: string, start: number, end: number) =>
  `GET_EXTERNAL_CONTROLS_MEMBERS_${securityId}_${start}_${end}`;

export const GET_EXTERNAL_CONTROL = (securityId: string) => `GET_EXTERNAL_CONTROL_${securityId}`;

export const GET_IS_EXTERNAL_CONTROL = (securityId: string) => `GET_IS_EXTERNAL_CONTROL_${securityId}`;

export const GET_IS_CONTROL_MOCK = (securityId: string) => `GET_IS_CONTROL_MOCK_${securityId}`;

export const useGetExternalControlListsCount = <TError, TData = number>(
  request: GetExternalControlListsCountRequest,
  options?: UseQueryOptions<number, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_EXTERNAL_CONTROL_LIST_COUNT(request.securityId)],
    () => SDKService.getExternalControlListsCount(request),
    options,
  );
};

export const useGetExternalPausesMembers = <TError, TData = string[]>(
  params: GetExternalControlListsMembersRequest,
  options?: UseQueryOptions<string[], TError, TData, [string]>,
) => {
  return useQuery(
    [GET_EXTERNAL_CONTROLS_MEMBERS(params.securityId, params.start, params.end)],
    () => SDKService.getExternalControlListsMembers(params),
    options,
  );
};

export const useGetExternalControls = (securityId: string, start: number = 0) => {
  const countQuery = useGetExternalControlListsCount(new GetExternalControlListsCountRequest({ securityId }), {
    retry: false,
  });

  const membersQuery = useGetExternalPausesMembers(
    new GetExternalControlListsMembersRequest({
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
