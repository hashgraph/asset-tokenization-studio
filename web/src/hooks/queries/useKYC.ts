import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { GetKYCAccountsRequest } from "@hashgraph/asset-tokenization-sdk";

export const GET_KYC_LIST = (securityId: string) => `GET_KYC_LIST${securityId}`;

export const useGetKYCList = (
  request: GetKYCAccountsRequest,
  options?: UseQueryOptions<
    string[],
    unknown,
    { accountId: string; validFrom: string; validTo: string; vcId: string }[],
    string[]
  >,
) => {
  return useQuery(
    [GET_KYC_LIST(request.securityId)],
    async () => {
      try {
        const kycAccounts = await SDKService.getKYCAccounts(request);
        return kycAccounts;
      } catch (error) {
        console.error("Error fetching KYC Accounts", error);
        throw error;
      }
    },
    options,
  );
};
