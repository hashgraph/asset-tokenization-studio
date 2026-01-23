// SPDX-License-Identifier: Apache-2.0

import { DefinitionList, ClipboardButton } from "io-bricks-ui";
import { VStack, Box, HStack, Text } from "@chakra-ui/react";
import { Asset } from "@/services/AssetService";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface DetailsProps {
  assetData: Asset | null;
  isLoading: boolean;
}

export const Details = ({ assetData, isLoading }: DetailsProps) => {
  const { t } = useTranslation("assets");
  const assetDetailsItems = [
    {
      title: t("detail.tabs.details.name"),
      description: assetData?.name ?? "",
    },
    {
      title: t("detail.tabs.details.symbol"),
      description: assetData?.symbol ?? "",
    },
    ...(assetData?.maturityDate
      ? [
          {
            title: t("detail.tabs.details.maturityDate"),
            description: format(new Date(assetData.maturityDate), "dd/MM/yyyy"),
          },
        ]
      : []),
    {
      title: t("detail.tabs.details.assetId"),
      description: assetData?.hederaTokenAddress ? (
        <HStack>
          <Text>{assetData.hederaTokenAddress}</Text>
          <ClipboardButton value={assetData.hederaTokenAddress} />
        </HStack>
      ) : (
        ""
      ),
    },
    {
      title: t("detail.tabs.details.assetEvmAdress"),
      description: assetData?.evmTokenAddress ? (
        <HStack>
          <Text>{assetData.evmTokenAddress}</Text>
          <ClipboardButton value={assetData.evmTokenAddress} />
        </HStack>
      ) : (
        ""
      ),
    },
    {
      title: t("detail.tabs.details.distributionsSC"),
      description: assetData?.lifeCycleCashFlowHederaAddress ? (
        <HStack>
          <Text>{assetData.lifeCycleCashFlowHederaAddress}</Text>
          <ClipboardButton value={assetData.lifeCycleCashFlowHederaAddress} />
        </HStack>
      ) : (
        ""
      ),
    },
    {
      title: t("detail.tabs.details.lifecycleEvmAdress"),
      description: assetData?.lifeCycleCashFlowEvmAddress ? (
        <HStack>
          <Text>{assetData.lifeCycleCashFlowEvmAddress}</Text>
          <ClipboardButton value={assetData.lifeCycleCashFlowEvmAddress} />
        </HStack>
      ) : (
        ""
      ),
    },
    {
      title: t("detail.tabs.details.type"),
      description: assetData?.type ?? "",
    },
  ];

  return (
    <Box
      bg="neutral.50"
      borderRadius="lg"
      boxShadow="sm"
      pt={16}
      px={12}
      pb={12}
      minH="720px"
      flex="1"
      display="flex"
      flexDirection="column"
      w="full"
    >
      <VStack w="full" gap={12} align="center">
        <Box maxW="550" w="full">
          <DefinitionList isLoading={isLoading} items={assetDetailsItems} title="Asset details" />
        </Box>
      </VStack>
    </Box>
  );
};
