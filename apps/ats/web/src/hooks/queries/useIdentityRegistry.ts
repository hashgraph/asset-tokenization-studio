// SPDX-License-Identifier: Apache-2.0

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { IdentityRegistryRequest } from "@hashgraph/asset-tokenization-sdk";

export const GET_IDENTITY_REGISTRY = (securityId: string) => `GET_IDENTITY_REGISTRY_${securityId}`;

export const useGetIdentityRegistry = <TError, TData = string>(
  request: IdentityRegistryRequest,
  options?: UseQueryOptions<string, TError, TData, [string]>,
) => {
  return useQuery([GET_IDENTITY_REGISTRY(request.securityId)], () => SDKService.getIdentityRegistry(request), options);
};
