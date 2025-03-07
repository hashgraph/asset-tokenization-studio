import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { DEFAULT_PARTITION } from "../../utils/constants";
import {
  ClearingViewModel,
  GetClearingForByPartitionRequest,
  GetClearingsIdForByPartitionRequest,
  IsClearingActivatedRequest,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_CLEARING_OPERATIONS_LIST = (securityId: string) =>
  `GET_CLEARING_OPERATIONS_LIST_${securityId}`;
export const GET_CLEARING_OPERATION_MODE = (securityId: string) =>
  `GET_CLEARING_OPERATION_MODE_${securityId}`;

interface UseGetClearingOperationsRequest {
  securityId: string;
  targetId: string;
  partitionId: string;
  start: number;
  end: number;
}

export const useGetClearingOperations = (
  request: UseGetClearingOperationsRequest,
  options?: UseQueryOptions<
    ClearingViewModel[],
    unknown,
    ClearingViewModel[],
    string[]
  >,
) => {
  return useQuery(
    [GET_CLEARING_OPERATIONS_LIST(request.securityId)],
    async () => {
      try {
        const clearingOperationTypes = [0, 1, 2];

        const clearingsIdsByType = await Promise.all(
          clearingOperationTypes.map(async (operationType) => {
            const partitionRequest = new GetClearingsIdForByPartitionRequest({
              ...request,
              clearingOperationType: operationType,
            });

            const clearingIds =
              await SDKService.getClearingsIdForByPartition(partitionRequest);
            return { operationType, clearingIds };
          }),
        );

        const clearingsDetails = await Promise.all(
          clearingsIdsByType.flatMap(({ operationType, clearingIds }) =>
            clearingIds.map(async (clearingId) => {
              const clearingRequest = new GetClearingForByPartitionRequest({
                securityId: request.securityId,
                targetId: request.targetId,
                clearingId: Number(clearingId),
                partitionId: DEFAULT_PARTITION,
                clearingOperationType: operationType,
              });
              return await SDKService.getClearingForByPartition(
                clearingRequest,
              );
            }),
          ),
        );

        return clearingsDetails;
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
        const isClearingActivated =
          await SDKService.isClearingActivated(request);

        return isClearingActivated;
      } catch (error) {
        console.error("Error fetching clearing operations", error);
        throw error;
      }
    },
    options,
  );
};
