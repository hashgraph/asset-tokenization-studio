// SPDX-License-Identifier: Apache-2.0

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  GetProceedRecipientsCountRequest,
  GetProceedRecipientsRequest,
  GetProceedRecipientDataRequest,
} from "@hashgraph/asset-tokenization-sdk";

export interface ProceedRecipientDataViewModelResponse {
  address: string;
  data?: string;
}

export const GET_PROCEED_RECIPIENT_LIST = (securityId: string) => `GET_PROCEED_RECIPIENT_LIST_${securityId}`;

export const IS_INTERNAL_PROCEED_RECIPIENT_ACTIVATED = (securityId: string) =>
  `IS_INTERNAL_PROCEED_RECIPIENT_ACTIVATED_${securityId}`;

export const useGetProceedRecipientList = (
  request: GetProceedRecipientsCountRequest,
  options?: UseQueryOptions<
    ProceedRecipientDataViewModelResponse[],
    unknown,
    ProceedRecipientDataViewModelResponse[],
    string[]
  >,
) => {
  return useQuery(
    [GET_PROCEED_RECIPIENT_LIST(request.securityId)],
    async () => {
      try {
        const proceedRecipientsCount = await SDKService.getProceedRecipientsCount(request);

        const proceedRecipients = await SDKService.getProceedRecipients(
          new GetProceedRecipientsRequest({
            securityId: request.securityId,
            pageIndex: 0,
            pageSize: proceedRecipientsCount ?? 100,
          }),
        );

        const proceedRecipientsWithData = await Promise.all(
          proceedRecipients.map(async (proceedRecipient) => {
            try {
              const data = await SDKService.getProceedRecipientData(
                new GetProceedRecipientDataRequest({
                  securityId: request.securityId,
                  proceedRecipientId: proceedRecipient,
                }),
              );
              return {
                address: proceedRecipient,
                data,
              } as ProceedRecipientDataViewModelResponse;
            } catch (error) {
              console.error("Error fetching proceed recipient data", error);
              return { address: proceedRecipient, data: undefined };
            }
          }),
        );

        return proceedRecipientsWithData;
      } catch (error) {
        console.error("Error fetching proceed recipients", error);
        throw error;
      }
    },
    options,
  );
};
