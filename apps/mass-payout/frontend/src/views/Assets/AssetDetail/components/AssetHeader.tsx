import { VStack, HStack, Spacer } from "@chakra-ui/react";
import { Breadcrumb, Tag, Text } from "io-bricks-ui";
import { GobackButton } from "@/components/GobackButton";
import { useTranslation } from "react-i18next";
import type { Asset } from "@/services/AssetService";
import type { BreadcrumbItem } from "@/hooks/useBreadcrumbs";

interface AssetHeaderProps {
  asset: Asset;
  routes: BreadcrumbItem[];
  isPaused: boolean;
}

export const AssetHeader = ({ asset, routes, isPaused }: AssetHeaderProps) => {
  const { t } = useTranslation("assets");

  const assetLabel = `${asset.name} - ${asset.hederaTokenAddress}`;
  const status = isPaused ? t("detail.status.paused") : t("detail.status.active");
  const statusVariant = isPaused ? "paused" : "active";

  return (
    <VStack alignItems="left" gap="12px" mb={6}>
      <Breadcrumb items={routes} />
      <HStack align="center" w="full">
        <HStack align="center" spacing={2}>
          <GobackButton label={assetLabel} mr={4} />
          <HStack>
            <Text textStyle="ElementsRegularXS" color="neutral.700">
              {t("distributionsStatus")}
            </Text>
            <Tag label={status} variant={statusVariant} size="md" />
          </HStack>
        </HStack>
        <Spacer />
      </HStack>
    </VStack>
  );
};
