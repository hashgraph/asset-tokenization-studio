// SPDX-License-Identifier: Apache-2.0

import {
  GetHeldAmountForRequest,
  GetHoldForByPartitionRequest,
  GetHoldsIdForByPartitionRequest,
  HoldViewModel,
} from "@hashgraph/asset-tokenization-sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { DEFAULT_PARTITION } from "../../utils/constants";

export const GET_HOLDS = (securityId: string, targetId: string) => `GET_HOLDS_${securityId}_${targetId}`;
export const GET_HELD_BALANCE = (securityId: string, targetId: string) => `GET_HELD_BALANCE_${securityId}_${targetId}`;

export const useGetHolds = (
  request: GetHoldsIdForByPartitionRequest,
  options?: UseQueryOptions<HoldViewModel[], unknown, HoldViewModel[], string[]>,
) => {
  return useQuery(
    [GET_HOLDS(request.securityId, request.targetId)],
    async () => {
      try {
        const holdIds = await SDKService.getHoldsId(request);

        const holdDetails = await Promise.all(
          holdIds.map(async (holdId) => {
            const holdRequest = new GetHoldForByPartitionRequest({
              securityId: request.securityId,
              targetId: request.targetId,
              holdId: Number(holdId),
              partitionId: DEFAULT_PARTITION,
            });
            return await SDKService.getHoldDetails(holdRequest);
          }),
        );

        return holdDetails.filter((hold): hold is HoldViewModel => hold !== null);
      } catch (error) {
        console.error("Error fetching holds", error);
        throw error;
      }
    },
    options,
  );
};

export const useGetHeldAmountFor = (
  request: GetHeldAmountForRequest,
  options?: UseQueryOptions<number, unknown, number, string[]>,
) => {
  return useQuery(
    [GET_HELD_BALANCE(request.securityId, request.targetId)],
    async () => {
      try {
        const heldAmount = await SDKService.getHeldAmountFor(request);

        return heldAmount;
      } catch (error) {
        console.error("Error fetching holds", error);
        throw error;
      }
    },
    options,
  );
};
