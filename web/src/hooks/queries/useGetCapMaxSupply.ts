import {
  GetMaxSupplyRequest,
  MaxSupplyViewModel,
} from "@hashgraph/asset-tokenization-sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";

export const GET_CAP_MAX_SUPPLY = (securityId: string) =>
  `GET_CAP_MAX_SUPPLY_${securityId}`;

export const useGetCapMaxSupply = (
  request: GetMaxSupplyRequest,
  options?: UseQueryOptions<
    MaxSupplyViewModel,
    unknown,
    MaxSupplyViewModel,
    string[]
  >,
) => {
  return useQuery(
    [GET_CAP_MAX_SUPPLY(request.securityId)],
    async () => {
      try {
        const maxSupply = await SDKService.getMaxSupply(request);

        return maxSupply;
      } catch (error) {
        console.error("Error fetching max supply", error);
        throw error;
      }
    },
    options,
  );
};
