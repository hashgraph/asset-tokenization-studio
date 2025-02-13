import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  GetKYCAccountsDataRequest,
  KYCViewModel,
} from "@hashgraph/asset-tokenization-sdk";

export const GET_KYC_LIST = (securityId: string) => `GET_KYC_LIST${securityId}`;

export const useGetKYCList = (
  request: GetKYCAccountsDataRequest,
  options?: UseQueryOptions<KYCViewModel[], unknown, KYCViewModel[], string[]>,
) => {
  return useQuery(
    [GET_KYC_LIST(request.securityId)],
    async () => {
      try {
        const kycAccounts = await SDKService.getKYCAccountsData(request);
        return kycAccounts;
      } catch (error) {
        console.error("Error fetching KYC Accounts", error);
        throw error;
      }
    },
    options,
  );
};
