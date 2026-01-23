// SPDX-License-Identifier: Apache-2.0

import {
  GetAllVotingRightsRequest,
  GetTotalVotingHoldersRequest,
  GetVotingHoldersRequest,
  GetVotingRightsForRequest,
  GetVotingRightsRequest,
  SetVotingRightsRequest,
  VotingRightsForViewModel,
  VotingRightsViewModel,
} from "@hashgraph/asset-tokenization-sdk";
import { UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";

export const GET_ALL_VOTING_RIGHTS = (securityId: string) => `GET_ALL_VOTING_RIGHTS_${securityId}`;

export const GET_VOTING_RIGHTS_FOR = (securityId: string, targetId: string, votingId: number) =>
  `GET_VOTING_RIGHTS_FOR_${securityId}_${targetId}_${votingId}`;

export const GET_VOTING_RIGHTS = (securityId: string, votingId: number) =>
  `GET_VOTING_RIGHTS_${securityId}_${votingId}`;

export const GET_VOTING_RIGHTS_HOLDERS = (securityId: string, votingId: number) =>
  `GET_VOTING_RIGHTS_HOLDERS_${securityId}_${votingId}`;

export const GET_VOTING_RIGHTS_TOTAL_HOLDERS = (securityId: string, votingId: number) =>
  `GET_VOTING_RIGHTS_TOTAL_HOLDERS_${securityId}_${votingId}`;

export const useSetVotingRights = () => {
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.votingRights.messages",
  });

  return useMutation(
    (setVotingRightsRequest: SetVotingRightsRequest) => SDKService.setVotingRights(setVotingRightsRequest),
    {
      onSuccess: () =>
        toast.show({
          duration: 3000,
          title: `${t("success")}`,
          description: `${t("descriptionSuccess")}`,
          variant: "subtle",
          status: "success",
        }),
    },
  );
};

export const useGetAllVotingRights = <TError, TData = VotingRightsViewModel[]>(
  params: GetAllVotingRightsRequest,
  options: UseQueryOptions<VotingRightsViewModel[], TError, TData, [string]> = {},
) => {
  return useQuery([GET_ALL_VOTING_RIGHTS(params.securityId)], () => SDKService.getAllVotingRights(params), options);
};

export const useGetVotingRightsFor = <TError, TData = VotingRightsForViewModel>(
  params: GetVotingRightsForRequest,
  options: UseQueryOptions<VotingRightsForViewModel, TError, TData, [string]> = {},
) => {
  return useQuery(
    [GET_VOTING_RIGHTS_FOR(params.securityId, params.targetId, params.votingId)],
    () => SDKService.getVotingRightsFor(params),
    options,
  );
};

export const useGetVotingRights = <TError, TData = VotingRightsViewModel>(
  params: GetVotingRightsRequest,
  options: UseQueryOptions<VotingRightsViewModel, TError, TData, [string]> = {},
) => {
  return useQuery(
    [GET_VOTING_RIGHTS(params.securityId, params.votingId)],
    () => SDKService.getVotingRights(params),
    options,
  );
};

export const useGetVotingHolders = <TError, TData = string[]>(
  params: GetVotingHoldersRequest,
  options: UseQueryOptions<string[], TError, TData, [string]> = {},
) => {
  return useQuery(
    [GET_VOTING_RIGHTS_HOLDERS(params.securityId, params.voteId)],
    () => SDKService.getVotingHolders(params),
    options,
  );
};

export const useGetTotalVotingHolders = <TError, TData = number>(
  params: GetTotalVotingHoldersRequest,
  options: UseQueryOptions<number, TError, TData, [string]> = {},
) => {
  return useQuery(
    [GET_VOTING_RIGHTS_TOTAL_HOLDERS(params.securityId, params.voteId)],
    () => SDKService.getTotalVotingHolders(params),
    options,
  );
};
