// SPDX-License-Identifier: Apache-2.0

import { UseQueryOptions, useQueries, useQuery } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  GetExternalPausesCountRequest,
  GetExternalPausesMembersRequest,
  IsExternalPauseRequest,
  IsPausedMockRequest,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_EXTERNAL_PAUSES_COUNT = (securityId: string) => `GET_EXTERNAL_PAUSES_COUNT_${securityId}`;

export const GET_CONTROL_LIST_MEMBERS = (securityId: string, start: number, end: number) =>
  `GET_EXTERNAL_PAUSES_MEMBERS_${securityId}_${start}_${end}`;

export const GET_EXTERNAL_PAUSE = (securityId: string) => `GET_EXTERNAL_PAUSE_${securityId}`;

export const GET_IS_EXTERNAL_PAUSE = (securityId: string) => `GET_IS_EXTERNAL_PAUSE_${securityId}`;

export const GET_IS_PAUSE_MOCK = (securityId: string) => `GET_IS_PAUSE_MOCK_${securityId}`;

export const useGetExternalPausesCount = <TError, TData = number>(
  request: GetExternalPausesCountRequest,
  options?: UseQueryOptions<number, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_EXTERNAL_PAUSES_COUNT(request.securityId)],
    () => SDKService.getExternalPausesCount(request),
    options,
  );
};

export const useGetExternalPausesMembers = <TError, TData = string[]>(
  params: GetExternalPausesMembersRequest,
  options?: UseQueryOptions<string[], TError, TData, [string]>,
) => {
  return useQuery(
    [GET_CONTROL_LIST_MEMBERS(params.securityId, params.start, params.end)],
    () => SDKService.getExternalPausesMembers(params),
    options,
  );
};

export const useGetExternalPauses = (securityId: string, start: number = 0) => {
  const countQuery = useGetExternalPausesCount(new GetExternalPausesCountRequest({ securityId }), {
    retry: false,
  });

  const membersQuery = useGetExternalPausesMembers(
    new GetExternalPausesMembersRequest({
      securityId,
      start,
      end: countQuery.data ?? 0,
    }),
    { retry: false },
  );

  const pauseStatusQueries = useQueries({
    queries: (membersQuery.data ?? []).map((memberId) => ({
      queryKey: [GET_IS_EXTERNAL_PAUSE(memberId)],
      queryFn: () =>
        SDKService.isPauseMock(
          new IsPausedMockRequest({
            contractId: memberId,
          }),
        ),
      enabled: !!membersQuery.data,
      retry: false,
    })),
  });

  const isLoading = membersQuery.isLoading || pauseStatusQueries.some((q) => q.isLoading);
  const isError = membersQuery.isError || pauseStatusQueries.some((q) => q.isError);

  const data = (membersQuery.data ?? []).map((memberId, index) => ({
    id: memberId,
    isPaused: pauseStatusQueries[index]?.data ?? false,
  }));

  return {
    isLoading,
    isError,
    data,
  };
};

export const useIsExternalPause = <TError, TData = string[]>(
  request: IsExternalPauseRequest,
  options?: UseQueryOptions<boolean, TError, TData, [string]>,
) => {
  return useQuery([GET_IS_EXTERNAL_PAUSE(request.securityId)], () => SDKService.isExternalPause(request), options);
};

export const useIsPauseMock = <TError, TData = boolean>(
  request: IsPausedMockRequest,
  options?: UseQueryOptions<boolean, TError, TData, [string]>,
) => {
  return useQuery([GET_IS_PAUSE_MOCK(request.contractId)], () => SDKService.isPauseMock(request), options);
};
