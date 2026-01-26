// SPDX-License-Identifier: Apache-2.0

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  GetClearingsIdForByPartitionRequest,
  IsClearingActivatedRequest,
  GetClearingRedeemForByPartitionRequest,
  GetClearingTransferForByPartitionRequest,
  GetClearingCreateHoldForByPartitionRequest,
  GetClearedAmountForRequest,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_CLEARING_OPERATIONS_LIST = (securityId: string) => `GET_CLEARING_OPERATIONS_LIST_${securityId}`;
export const GET_CLEARING_OPERATION_MODE = (securityId: string) => `GET_CLEARING_OPERATION_MODE_${securityId}`;
export const GET_CLEARED_BALANCE = (securityId: string, targetId: string) =>
  `GET_CLEARED_BALANCE_${securityId}_${targetId}`;

interface UseGetClearingOperationsRequest {
  securityId: string;
  targetId: string;
  partitionId: string;
  start: number;
  end: number;
}

export interface ClearingOperationViewModel {
  id: number;
  operationType: number;
  amount: string;
  expirationDate: Date;
  data: string;
  operatorData: string;
  destination?: string;
  holdEscrow?: string;
  holdExpirationDate?: Date;
  holdTo?: string;
  holdData?: string;
}

export const useGetClearingOperations = (
  request: UseGetClearingOperationsRequest,
  options?: UseQueryOptions<ClearingOperationViewModel[], unknown, ClearingOperationViewModel[], string[]>,
) => {
  return useQuery(
    [GET_CLEARING_OPERATIONS_LIST(request.securityId)],
    async (): Promise<ClearingOperationViewModel[]> => {
      try {
        const clearingOperationTypes = [0, 1, 2];

        const results = await Promise.all(
          clearingOperationTypes.map(async (operationType) => {
            const clearingIds = await SDKService.getClearingsIdForByPartition(
              new GetClearingsIdForByPartitionRequest({
                ...request,
                clearingOperationType: operationType,
              }),
            );

            if (!clearingIds.length) return [];

            const operations = await Promise.all(
              clearingIds.map(async (clearingId) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let result: any = null;

                if (operationType === 0) {
                  result = await SDKService.getClearingTransferForByPartition(
                    new GetClearingTransferForByPartitionRequest({
                      ...request,
                      clearingId,
                    }),
                  );
                } else if (operationType === 1) {
                  result = await SDKService.getClearingRedeemForByPartition(
                    new GetClearingRedeemForByPartitionRequest({
                      ...request,
                      clearingId,
                    }),
                  );
                } else if (operationType === 2) {
                  result = await SDKService.getClearingCreateHoldForByPartition(
                    new GetClearingCreateHoldForByPartitionRequest({
                      ...request,
                      clearingId,
                    }),
                  );
                }

                if (!result) return null;

                return {
                  operationType,
                  id: clearingId,
                  amount: result.amount,
                  expirationDate: new Date(result.expirationDate),
                  data: result.data || "",
                  operatorData: result.operatorData || "",
                  destination: result.destination,
                  holdEscrow: result.holdEscrow,
                  holdExpirationDate: result.holdExpirationDate ? new Date(result.holdExpirationDate) : undefined,
                  holdTo: result.holdTo,
                  holdData: result.holdData,
                } as ClearingOperationViewModel;
              }),
            );

            return operations.filter(Boolean);
          }),
        );

        return results.flat().filter(Boolean) as ClearingOperationViewModel[];
      } catch (error) {
        console.error("Error fetching clearing operations", error);
        throw error;
      }
    },
    options,
  );
};

export const useGetIsClearingActivated = (
  request: IsClearingActivatedRequest,
  options?: UseQueryOptions<boolean, unknown, boolean, string[]>,
) => {
  return useQuery(
    [GET_CLEARING_OPERATION_MODE(request.securityId)],
    async () => {
      try {
        const isClearingActivated = await SDKService.isClearingActivated(request);

        return isClearingActivated;
      } catch (error) {
        console.error("Error fetching clearing operations", error);
        throw error;
      }
    },
    options,
  );
};

export const useGetClearedAmountFor = (
  request: GetClearedAmountForRequest,
  options?: UseQueryOptions<number, unknown, number, string[]>,
) => {
  return useQuery(
    [GET_CLEARED_BALANCE(request.securityId, request.targetId)],
    async () => {
      try {
        const clearedAmount = await SDKService.getClearedAmountFor(request);

        return clearedAmount;
      } catch (error) {
        console.error("Error fetching cleared amount", error);
        throw error;
      }
    },
    options,
  );
};
