import {
  GetLockRequest,
  GetLocksIdRequest,
  LockViewModel,
} from "@hashgraph/asset-tokenization-sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";

export const GET_LOCKERS = (securityId: string, targetId: string) =>
  `GET_LOCKERS_${securityId}_${targetId}`;

export const useGetLockers = (
  request: GetLocksIdRequest,
  options?: UseQueryOptions<
    LockViewModel[],
    unknown,
    LockViewModel[],
    string[]
  >,
) => {
  return useQuery(
    [GET_LOCKERS(request.securityId, request.targetId)],
    async () => {
      try {
        const locksId = await SDKService.getLocksId(request);

        const lockDetails = await Promise.all(
          locksId.map(async (lockId) => {
            const lockRequest = new GetLockRequest({
              securityId: request.securityId,
              targetId: request.targetId,
              id: Number(lockId),
            });
            return await SDKService.getLock(lockRequest);
          }),
        );

        return lockDetails.filter(
          (lock): lock is LockViewModel => lock !== null,
        );
      } catch (error) {
        console.error("Error fetching lockers", error);
        throw error;
      }
    },
    options,
  );
};
