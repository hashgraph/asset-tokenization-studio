// SPDX-License-Identifier: Apache-2.0

import { Stack, HStack, VStack } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { useTranslation, Trans } from "react-i18next";
import { useEffect } from "react";
import { Text, InputController, Button, PhosphorIcon, IconButton, InfoDivider } from "io-bricks-ui";
import { RouteName } from "@/router/RouteName";
import { RouterManager } from "@/router/RouterManager";
import { Eject } from "@phosphor-icons/react";
import { ImportAssetFormValues } from "../ImportAsset";
import { useGetAssetMetadata } from "../../hooks/queries/AssetQueries";

interface StepAssetDetailsProps {
  goToNext: () => void;
}

export const StepAssetDetails = ({ goToNext }: StepAssetDetailsProps) => {
  const { t } = useTranslation("importAsset");
  const { control, watch, setValue } = useFormContext<ImportAssetFormValues>();

  const assetId = watch("assetId");

  const { data: assetMetadata, isLoading, isPending, refetch } = useGetAssetMetadata(assetId || "");

  const handleCancel = () => {
    RouterManager.to(RouteName.Assets);
  };

  const handleFetchAsset = () => {
    if (!assetId) return;
    refetch();
  };

  useEffect(() => {
    if (assetMetadata) {
      setValue("assetName", assetMetadata.name);
      setValue("assetSymbol", assetMetadata.symbol);
      setValue("assetType", assetMetadata.assetType);
    }
  }, [assetMetadata, setValue]);

  return (
    <Stack gap={8} w="full" maxW="500px" align="flex-start" mt={12}>
      <Stack gap={2} align="flex-start">
        <Text textStyle="HeadingMediumLG" color="neutral.800">
          {t("details.title")}
        </Text>
        <Text textStyle="BodyTextRegularMD" color="neutral.800">
          {t("details.subtitle")}
        </Text>
      </Stack>
      <Text textStyle="BodyTextRegularMD" color="neutral.800">
        {t("details.description")}
      </Text>
      <Stack gap={6} w="full">
        <Stack gap={2} w="full">
          <Text textStyle="BodyTextRegularSM" fontWeight="medium">
            {t("form.assetId.label")}
          </Text>
          <HStack spacing={4} alignItems="flex-start">
            <InputController
              autoFocus
              control={control}
              id="assetId"
              rules={{
                required: t("form.assetId.required"),
              }}
              placeholder={t("form.assetId.placeholder")}
              size="md"
              w="full"
            />
            <IconButton
              aria-label="fetch-button"
              icon={<PhosphorIcon as={Eject} />}
              size="md"
              variant="primary"
              onClick={handleFetchAsset}
              isLoading={isLoading}
              isDisabled={!assetId || isLoading}
            />
          </HStack>
        </Stack>
      </Stack>
      {assetMetadata && (
        <VStack gap={6} w="full" align="flex-start">
          <InfoDivider title={t("details.assetInfo")} type="main" />
          <Text textStyle="BodyTextRegularMD" color="neutral.800">
            <Trans
              i18nKey="importAsset:details.assetName"
              values={{ name: assetMetadata.name }}
              components={{
                bold: <Text as="span" fontWeight="bold" />,
              }}
            />
          </Text>
          <Text textStyle="BodyTextRegularMD" color="neutral.800">
            <Trans
              i18nKey="importAsset:details.symbol"
              values={{ symbol: assetMetadata.symbol }}
              components={{
                bold: <Text as="span" fontWeight="bold" />,
              }}
            />
          </Text>
          <Text textStyle="BodyTextRegularMD" color="neutral.800">
            <Trans
              i18nKey="importAsset:details.assetType"
              values={{ type: assetMetadata.assetType }}
              components={{
                bold: <Text as="span" fontWeight="bold" />,
              }}
            />
          </Text>
        </VStack>
      )}
      <HStack w="full" pt={4} justifyContent="space-between">
        <Button variant="secondary" onClick={handleCancel} size="md">
          {t("buttons.cancel")}
        </Button>
        <Button variant="primary" isDisabled={isPending} onClick={goToNext} size="md">
          {t("buttons.nextStep")}
        </Button>
      </HStack>
    </Stack>
  );
};
