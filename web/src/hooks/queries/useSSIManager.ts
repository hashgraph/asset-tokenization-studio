import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  GetIssuerListMembersRequest,
  GetRevocationRegistryAddressRequest,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_ISSUERS_LIST = (securityId: string) =>
  `GET_ISSUERS_LIST_${securityId}`;

export const GET_REVOCATION_REGISTRY_ADDRESS = (securityId: string) =>
  `GET_REVOCATION_REGISTRY_ADDRESS_${securityId}`;

export const useGetIssuersList = (
  request: GetIssuerListMembersRequest,
  options?: UseQueryOptions<
    string[],
    unknown,
    { accountId: string }[],
    string[]
  >,
) => {
  return useQuery(
    [GET_ISSUERS_LIST(request.securityId)],
    async () => {
      try {
        const issuersIds = await SDKService.getIssuerListMembers(request);
        return issuersIds;
      } catch (error) {
        console.error("Error fetching lockers", error);
        throw error;
      }
    },
    options,
  );
};

export const useGetRevocationRegistryAddress = (
  request: GetRevocationRegistryAddressRequest,
  options?: UseQueryOptions<string, unknown, string, string[]>,
) => {
  return useQuery(
    [GET_REVOCATION_REGISTRY_ADDRESS(request.securityId)],
    async () => {
      try {
        const revocationRegistryAddress =
          await SDKService.getRevocationRegistryAddress(request);
        return revocationRegistryAddress;
      } catch (error) {
        console.error("Error fetching revocation registry address", error);
        throw error;
      }
    },
    options,
  );
};
