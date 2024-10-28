import {
  GetConfigInfoRequest,
  ConfigInfoViewModel,
} from "@hashgraph/asset-tokenization-sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";

export const GET_CONFIG_INFO = (securityId: string) =>
  `GET_CONFIG_INFO_${securityId}}`;

export const useGetConfigDetails = <TError, TData = ConfigInfoViewModel>(
  request: GetConfigInfoRequest,
  options?: UseQueryOptions<ConfigInfoViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_CONFIG_INFO(request.securityId)],
    () => SDKService.getConfigInfo(request),
    options,
  );
};
