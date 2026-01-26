// SPDX-License-Identifier: Apache-2.0

import { GetFrozenPartialTokensRequest } from "@hashgraph/asset-tokenization-sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";

export const GET_FROZEN_BALANCE = (securityId: string, targetId: string) =>
  `GET_FROZEN_BALANCE_${securityId}_${targetId}`;

export const useGetFrozenTokens = (
  request: GetFrozenPartialTokensRequest,
  options?: UseQueryOptions<number, unknown, number, string[]>,
) => {
  return useQuery(
    [GET_FROZEN_BALANCE(request.securityId, request.targetId)],
    async () => {
      try {
        const freezeAmount = Number((await SDKService.getFrozenTokens(request)).value);

        return freezeAmount;
      } catch (error) {
        console.error("Error fetching freeze", error);
        throw error;
      }
    },
    options,
  );
};
