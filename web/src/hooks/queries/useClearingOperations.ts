import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { DEFAULT_PARTITION } from "../../utils/constants";

export const GET_CLEARING_OPERATIONS_LIST = (securityId: string) =>
  `GET_CLEARING_OPERATIONS_LIST_${securityId}`;
export const GET_CLEARING_OPERATION_MODE = (securityId: string) =>
  `GET_CLEARING_OPERATION_MODE_${securityId}`;

export const useGetClearingOperations = (
  request: unknown,
  options?: UseQueryOptions<unknown[], unknown, unknown[], string[]>,
) => {
  return useQuery(
    [GET_CLEARING_OPERATIONS_LIST(request.securityId)],
    async () => {
      try {
        const clearingsIds =
          await SDKService.getClearingsIdForByPartition(request);

        const clearingsDetails = await Promise.all(
          clearingsIds.map(async (clearingId) => {
            const clearingRequest = new getClearingForByPartitionRequest({
              securityId: request.securityId,
              targetId: request.targetId,
              clearingId: Number(clearingId),
              partitionId: DEFAULT_PARTITION,
            });
            return await SDKService.getClearingForByPartition(clearingRequest);
          }),
        );

        return null;
      } catch (error) {
        console.error("Error fetching clearing operations", error);
        throw error;
      }
    },
    options,
  );
};

export const useGetIsClearingActivated = (
  request: unknown,
  options?: UseQueryOptions<unknown[], unknown, unknown[], string[]>,
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
