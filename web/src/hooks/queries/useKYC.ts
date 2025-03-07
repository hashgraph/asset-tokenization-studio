import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  GetKYCAccountsDataRequest,
  IsIssuerRequest,
  KycAccountDataViewModel,
} from "@hashgraph/asset-tokenization-sdk";

export interface KycAccountDataViewModelResponse
  extends KycAccountDataViewModel {
  isIssuer: boolean | null;
}

export const GET_KYC_LIST = (securityId: string) =>
  `GET_KYC_LIST_${securityId}`;

export const useGetKYCList = (
  request: GetKYCAccountsDataRequest,
  options?: UseQueryOptions<
    KycAccountDataViewModelResponse[],
    unknown,
    KycAccountDataViewModelResponse[],
    string[]
  >,
) => {
  return useQuery(
    [GET_KYC_LIST(request.securityId)],
    async () => {
      try {
        const kycAccounts = await SDKService.getKYCAccountsData(request);

        const kycAccountsWithIssuerStatus = await Promise.all(
          kycAccounts.map(async (kycAccount) => {
            try {
              const isIssuer = await SDKService.isIssuer(
                new IsIssuerRequest({
                  securityId: request.securityId,
                  issuerId: kycAccount.issuer,
                }),
              );
              return {
                ...kycAccount,
                isIssuer,
              } as KycAccountDataViewModelResponse;
            } catch (error) {
              console.error("Error fetching issuer status", error);
              return { ...kycAccount, isIssuer: null };
            }
          }),
        );

        return kycAccountsWithIssuerStatus;
      } catch (error) {
        console.error("Error fetching KYC Accounts", error);
        throw error;
      }
    },
    options,
  );
};
