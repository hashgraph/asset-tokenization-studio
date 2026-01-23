// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This component is not currently used. Kept for potential future usage.
 */

import { useTranslation } from "react-i18next";
import { DefinitionList } from "io-bricks-ui";
import { Box } from "@chakra-ui/react";

interface AssetDetail {
  assetId: string;
  lifecycleCashFlowId: string;
  maturityDate?: string;
  name: string;
  assetType: string;
}

interface DistributionDetail extends AssetDetail {
  distributionId: string;
  actionType: string;
  totalAmount: string;
  batchCount: number;
  holders: number;
  executionDate: string;
}

interface AssetDetailsProps {
  distributionData: DistributionDetail | AssetDetail | null;
  isLoading: boolean;
}

export function AssetDetails({ distributionData, isLoading }: AssetDetailsProps) {
  const { t } = useTranslation("distributions");

  const assetDetailsItems = [
    {
      title: t("detail.fields.assetId"),
      description: distributionData?.assetId ?? "",
    },
    {
      title: t("detail.fields.lifecycleCashFlowId"),
      description: distributionData?.lifecycleCashFlowId ?? "",
    },
    {
      title: t("detail.fields.maturityDate"),
      description: distributionData?.maturityDate ?? "",
    },
    {
      title: t("detail.fields.name"),
      description: distributionData?.name ?? "",
    },
    {
      title: t("detail.fields.assetType"),
      description: distributionData?.assetType ?? "",
    },
  ];

  return (
    <Box flex="1" bg="neutral.50" borderRadius="lg" boxShadow="sm" pt={4} px={6} pb={6}>
      <DefinitionList
        data-testid="definition-list"
        isLoading={isLoading}
        items={assetDetailsItems}
        title={t("detail.sections.assetDetails")}
      />
    </Box>
  );
}
