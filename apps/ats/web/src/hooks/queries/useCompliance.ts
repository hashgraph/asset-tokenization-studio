// SPDX-License-Identifier: Apache-2.0

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { ComplianceRequest } from "@hashgraph/asset-tokenization-sdk";

export const GET_COMPLIANCE = (securityId: string) => `GET_COMPLIANCE_${securityId}`;

export const useGetCompliance = <TError, TData = string>(
  request: ComplianceRequest,
  options?: UseQueryOptions<string, TError, TData, [string]>,
) => {
  return useQuery([GET_COMPLIANCE(request.securityId)], () => SDKService.getCompliance(request), options);
};
