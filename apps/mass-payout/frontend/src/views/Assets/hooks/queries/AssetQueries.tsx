// SPDX-License-Identifier: Apache-2.0

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AssetService,
  GetAssetsParams,
  GetAssetDistributionsParams,
  CreateManualPayoutParams,
} from "../../../../services/AssetService";

export const useGetAssets = (params: GetAssetsParams = {}) => {
  return useQuery({
    queryKey: ["assets", params],
    queryFn: () => AssetService.getAssets(params),
  });
};

export const useGetAsset = (assetId: string) => {
  return useQuery({
    queryKey: ["assets", assetId],
    queryFn: () => AssetService.getAsset(assetId),
    enabled: !!assetId,
  });
};

export const useGetAssetMetadata = (hederaTokenAddress: string) => {
  return useQuery({
    queryKey: ["assetMetadata", hederaTokenAddress],
    queryFn: () => AssetService.getAssetMetadata(hederaTokenAddress),
    enabled: false,
  });
};

export const usePauseAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => AssetService.pauseAsset(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      console.log("Asset paused successfully");
    },
    onError: (error) => {
      console.error("Error pausing asset:", error);
    },
  });
};

export const useUnpauseAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => AssetService.unpauseAsset(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      console.log("Asset resumed successfully");
    },
    onError: (error) => {
      console.error("Error unpausing asset:", error);
    },
  });
};

export const useImportAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hederaTokenAddress: string) => AssetService.importAsset(hederaTokenAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      console.log("Asset imported successfully");
    },
    onError: (error) => {
      console.error("Error importing asset:", error);
    },
  });
};

export const useGetAssetDistributions = (params: GetAssetDistributionsParams) => {
  return useQuery({
    queryKey: ["assetDistributions", params.assetId, params],
    queryFn: () => AssetService.getAssetDistributions(params),
    enabled: !!params.assetId,
  });
};

export const useCreateManualPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateManualPayoutParams) => AssetService.createManualPayout(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assetDistributions", variables.assetId],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
    },
  });
};

export const useEnableAssetSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => AssetService.enableAssetSync(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      console.log("Asset sync enabled successfully");
    },
    onError: (error) => {
      console.error("Error enabling asset sync:", error);
    },
  });
};

export const useDisableAssetSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => AssetService.disableAssetSync(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      console.log("Asset sync disabled successfully");
    },
    onError: (error) => {
      console.error("Error disabling asset sync:", error);
    },
  });
};
