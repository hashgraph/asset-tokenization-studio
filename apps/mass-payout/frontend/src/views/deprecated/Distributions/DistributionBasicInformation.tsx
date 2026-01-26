// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This component is not currently used. Kept for potential future usage.
 */

import { useTranslation } from "react-i18next";
import { DefinitionList } from "io-bricks-ui";
import { Box } from "@chakra-ui/react";

interface DistributionDetail {
  distributionId: string;
  actionType: string;
  executionDate: string;
  totalAmount: string;
  batchCount: number;
  holders: number;
}

interface DistributionBasicInformationProps {
  distributionData: DistributionDetail | null;
  isLoading: boolean;
}

export function DistributionBasicInformation({ distributionData, isLoading }: DistributionBasicInformationProps) {
  const { t } = useTranslation("distributions");

  const distributionDetailsItems = [
    {
      title: t("detail.fields.distributionId"),
      description: distributionData?.distributionId ?? "",
    },
    {
      title: t("detail.fields.type"),
      description: distributionData?.actionType ?? "",
    },
    {
      title: t("detail.fields.executionDate"),
      description: distributionData?.executionDate ?? "",
    },
    {
      title: t("detail.fields.totalAmount"),
      description: distributionData?.totalAmount ?? "",
    },
    {
      title: t("detail.fields.batchCount"),
      description: distributionData?.batchCount?.toString() ?? "",
    },
    {
      title: t("detail.fields.holders"),
      description: distributionData?.holders?.toString() ?? "",
    },
  ];

  return (
    <Box layerStyle="boxContainer">
      <DefinitionList
        isLoading={isLoading}
        items={distributionDetailsItems}
        title={t("detail.sections.distributionBasicInformation")}
      />
    </Box>
  );
}
