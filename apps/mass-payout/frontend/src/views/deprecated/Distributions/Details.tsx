// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This component is not currently used. Kept for potential future usage.
 */

import { Box, HStack } from "@chakra-ui/react";
import { DistributionBasicInformation } from "./DistributionBasicInformation";
import { AssetDetails } from "./AssetDetails";

interface DistributionDetail {
  distributionId: string;
  actionType: string;
  totalAmount: string;
  batchCount: number;
  holders: number;
  assetId: string;
  lifecycleCashFlowId: string;
  name: string;
  assetType: string;
  executionDate: string;
  maturityDate?: string;
}

interface DetailsProps {
  distributionData: DistributionDetail | null;
  isLoading: boolean;
}

export function Details({ distributionData, isLoading }: DetailsProps) {
  return (
    <Box pt={4} pl={0} pr={6} pb={6} minH="720px" flex="1" display="flex" flexDirection="column" w="full">
      <HStack w="full" gap={6} align="flex-start" justify="stretch">
        <DistributionBasicInformation distributionData={distributionData} isLoading={isLoading} />
        <AssetDetails distributionData={distributionData} isLoading={isLoading} />
      </HStack>
    </Box>
  );
}
