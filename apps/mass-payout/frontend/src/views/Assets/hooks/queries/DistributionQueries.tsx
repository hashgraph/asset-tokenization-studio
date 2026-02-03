// SPDX-License-Identifier: Apache-2.0

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DistributionService, GetDistributionsParams, GetHoldersParams } from "@/services/DistributionService";

export const useGetDistributions = (params: GetDistributionsParams = {}) => {
  return useQuery({
    queryKey: ["distributions", params],
    queryFn: () => DistributionService.getDistributions(params),
  });
};

export const useGetDistributionHolders = (params: GetHoldersParams) => {
  return useQuery({
    queryKey: ["distributionHolders", params.distributionId, params.page, params.size, params.search],
    queryFn: () => DistributionService.getDistributionHolders(params),
    enabled: !!params.distributionId,
  });
};

export const useGetDistribution = (distributionId: string) => {
  return useQuery({
    queryKey: ["distribution", distributionId],
    queryFn: () => DistributionService.getDistribution(distributionId),
    enabled: !!distributionId,
  });
};

export const useCancelDistribution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (distributionId: string) => DistributionService.cancelDistribution(distributionId),
    onSuccess: () => {
      // Invalidate all distribution-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["distribution"] });
      queryClient.invalidateQueries({ queryKey: ["assetDistributions"] });
    },
  });
};

export const useRetryDistribution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (distributionId: string) => DistributionService.retryDistribution(distributionId),
    onSuccess: () => {
      // Invalidate all distribution-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["distribution"] });
      queryClient.invalidateQueries({ queryKey: ["distributionHolders"] });
      queryClient.invalidateQueries({ queryKey: ["assetDistributions"] });
    },
  });
};
