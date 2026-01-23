// SPDX-License-Identifier: Apache-2.0

import { HStack, Stack, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { Button, DetailReview, DetailReviewProps, InfoDivider } from "io-bricks-ui";
import { ImportAssetFormValues } from "../ImportAsset";
import { useImportAsset } from "../../hooks/queries/AssetQueries";
import { RouterManager } from "@/router/RouterManager";
import { RouteName } from "@/router/RouteName";
import { FormStepContainer } from "@/components/FormStepContainer";
import { PreviousStepButton } from "../../Components/PreviousStepButton";

export const StepReview = () => {
  const { t } = useTranslation("importAsset");
  const { getValues } = useFormContext<ImportAssetFormValues>();
  const importAssetMutation = useImportAsset();

  const assetId = getValues("assetId");
  const assetName = getValues("assetName");
  const assetType = getValues("assetType");
  const assetSymbol = getValues("assetSymbol");

  const handleCancel = () => {
    RouterManager.to(RouteName.Assets);
  };

  const handleCreateAsset = async () => {
    if (!assetId) {
      console.error("Asset ID is required to import asset");
      return;
    }
    try {
      await importAssetMutation.mutateAsync(assetId);
      RouterManager.to(RouteName.Assets);
    } catch (error) {
      console.error("Error importing asset:", error);
    }
  };

  const assetDetails: DetailReviewProps[] = [
    {
      title: t("stepAssetDetails.assetId"),
      value: assetId,
    },
    {
      title: t("stepAssetDetails.assetName"),
      value: assetName,
    },
    {
      title: t("stepAssetDetails.symbol"),
      value: assetSymbol,
    },
    {
      title: t("stepAssetDetails.type"),
      value: assetType,
    },
  ];

  return (
    <FormStepContainer>
      <Stack w="full" spacing={8}>
        <VStack gap={6} align="flex-start" w="full">
          <InfoDivider step={1} title={t("review.assetConfiguration")} type="main" />

          <VStack gap={4} w="full" align="flex-start">
            {assetDetails.map((props, index) => (
              <DetailReview key={index} {...props} />
            ))}
          </VStack>
        </VStack>

        <HStack gap={3} w="full" justify="space-between" pt={8}>
          <Button size="md" variant="secondary" onClick={handleCancel} minW="80px">
            {t("buttons.cancel")}
          </Button>

          <HStack gap={3}>
            <PreviousStepButton />
            <Button
              size="md"
              variant="primary"
              onClick={handleCreateAsset}
              data-testid="final-import-asset-button"
              minW="100px"
              isLoading={importAssetMutation.isPending}
              isDisabled={importAssetMutation.isPending || !assetId}
            >
              {importAssetMutation.isPending ? t("buttons.importing") : t("buttons.importAsset")}
            </Button>
          </HStack>
        </HStack>
      </Stack>
    </FormStepContainer>
  );
};
