// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Stack, useDisclosure, VStack } from "@chakra-ui/react";
import { useForm, useWatch } from "react-hook-form";
import {
  Button,
  Text,
  PopUp,
  InputNumberController,
  Breadcrumb,
  RadioGroupController,
  PhosphorIcon,
  Weight,
  SelectController,
  InputController,
} from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { GobackButton } from "@/components/GobackButton";
import { useEffect } from "react";
import { Warning } from "@phosphor-icons/react";
import { useCreateManualPayout, useGetAsset } from "../hooks/queries/AssetQueries";
import { NewDistributionFormValues } from "./NewDistribution.types";
import {
  BREADCRUMB_ITEMS,
  createAmountTypeOptions,
  createDistributionTypeOptions,
  createRecurringOptions,
  createTriggerConditionOptions,
  DEFAULT_FORM_VALUES,
} from "./NewDistribution.constants";
import { createPayload, formatDistributionDescription, isFormValid } from "./NewDistribution.utils";
import { DateField } from "./components/DateField";

export const NewDistribution = () => {
  const { t } = useTranslation("assets");
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const createManualPayoutMutation = useCreateManualPayout();
  const { data: assetData } = useGetAsset(id || "");

  const {
    control,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm<NewDistributionFormValues>({
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const amountType = useWatch({ control, name: "amountType" });
  const amount = useWatch({ control, name: "amount" });
  const distributionType = useWatch({ control, name: "distributionType" });

  useEffect(() => {
    setValue("amount", 0);
  }, [amountType, setValue]);

  const formValues = getValues();
  const isFormValidResult = isFormValid(isValid, amount, formValues);

  const onSubmit = async (data: NewDistributionFormValues) => {
    if (
      id &&
      (data.distributionType === "manual" ||
        data.distributionType === "automated" ||
        (data.distributionType === "scheduled" && data.scheduledDate) ||
        (data.distributionType === "recurring" && data.recurringFrequency && data.recurringStartDate))
    ) {
      try {
        const payload = createPayload(id, data);
        await createManualPayoutMutation.mutateAsync(payload);
      } catch (error) {
        console.error("Error creating manual payout:", error);
      }
    } else {
      console.log("Making distribution with data:", {
        assetId: assetData?.id,
        assetName: assetData?.name,
        assetType: assetData?.type,
        ...data,
      });
      onOpen();
    }
  };

  const handleMakeNewDistribution = async () => {
    await onSubmit(formValues);
    onClose();
    if (id) {
      navigate(`/assets/${id}?tab=distributions`);
    } else {
      navigate("/assets");
    }
  };

  const handleClose = () => {
    // Only close the modal when the mutation is not pending
    if (!createManualPayoutMutation.isPending) {
      onClose();
    }
  };

  const distributionTypeOptions = createDistributionTypeOptions(t);
  const recurringOptions = createRecurringOptions(t);
  const triggerConditionOptions = createTriggerConditionOptions(t);
  const amountTypeOptions = createAmountTypeOptions(t);

  return (
    <Stack spacing="16px" w="full" h="full">
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <HStack align="center" w="full">
        <GobackButton label={t("newDistribution.title")} mr={4} />
        <Text textStyle="BodyRegularXS" color="neutral.500">
          {t("newDistribution.subtitle", {
            asset: assetData?.type,
            id: assetData?.id,
          })}
        </Text>
      </HStack>
      <Box
        bg="neutral.50"
        borderRadius="lg"
        boxShadow="sm"
        p={6}
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Stack gap={6} w="full" maxW="500px" align="flex-start" mt={2}>
          <Stack gap={2} align="flex-start">
            <Text textStyle="HeadingMediumLG">{t("newDistribution.configuration")}</Text>
            <Text textStyle="BodyTextRegularMD" color="gray.600">
              {t("newDistribution.description")}
            </Text>
          </Stack>

          <Stack gap={3} w="full">
            <HStack w="full">
              <Text textStyle="BodyTextRegularSM" fontWeight="medium">
                {t("newDistribution.assetId")}
              </Text>
              <Text textStyle="BodyTextRegularSM" color="gray.700" fontWeight="medium">
                {assetData?.id}
              </Text>
            </HStack>

            <HStack w="full">
              <Text textStyle="BodyTextRegularSM" fontWeight="medium">
                {t("newDistribution.assetName")}
              </Text>
              <Text textStyle="BodyTextRegularSM" color="gray.700" fontWeight="medium">
                {assetData?.name}
              </Text>
            </HStack>

            <HStack w="full">
              <Text textStyle="BodyTextRegularSM" fontWeight="medium">
                {t("newDistribution.assetType")}
              </Text>
              <Text textStyle="BodyTextRegularSM" color="gray.700" fontWeight="medium">
                {assetData?.type}
              </Text>
            </HStack>
            <VStack align="left">
              <SelectController
                id="distributionType"
                control={control}
                label={t("newDistribution.selectType")}
                options={distributionTypeOptions}
                isSearchable={false}
              />
              {distributionType === "automated" && (
                <Text textStyle="BodyRegularSM" color="neutral.800">
                  {t("newDistribution.selectInfo")}
                </Text>
              )}
            </VStack>
            <InputController
              control={control}
              id="concept"
              placeholder={t("newDistribution.conceptPlaceholder")}
              label={t("newDistribution.concept")}
              size="md"
              w="full"
            />
            <Stack gap={2} w="full">
              <Text textStyle="BodyTextRegularXXS" fontWeight="medium">
                {t("newDistribution.paymentType")}
              </Text>
              <RadioGroupController
                control={control}
                id="amountType"
                defaultValue="fixed"
                display="flex"
                flexDirection="column"
                gap={4}
                options={amountTypeOptions}
              />
            </Stack>
            <Stack gap={2} w="full">
              <InputNumberController
                label={t("newDistribution.amount")}
                control={control}
                id="amount"
                placeholder={amountType === "fixed" ? "0.00" : "0"}
                addonLeft={<Text>{amountType === "fixed" ? "$" : "%"}</Text>}
                minValue={0.01}
                maxValue={amountType === "percentage" ? 100 : undefined}
                decimalScale={2}
                decimalSeparator="."
                thousandSeparator=","
                size="md"
                w="full"
                rules={{
                  required: t("newDistribution.validation.amountRequired"),
                  min: {
                    value: 0.01,
                    message:
                      amountType === "fixed"
                        ? t("newDistribution.validation.minimumAmountFixed")
                        : t("newDistribution.validation.minimumAmountPercentage"),
                  },
                }}
              />
            </Stack>
            {distributionType === "scheduled" && (
              <Stack gap={2} w="full">
                <DateField
                  name="scheduledDate"
                  control={control}
                  label={t("newDistribution.scheduledExecutionTime")}
                  placeholder={t("newDistribution.selectDateAndTime")}
                  isRequired
                  requiredMessage={t("newDistribution.validation.scheduledDateRequired")}
                  futureDateMessage={t("newDistribution.validation.futureDateRequired")}
                />
              </Stack>
            )}
            {distributionType === "recurring" && (
              <>
                <Stack gap={2} w="full">
                  <SelectController
                    id="recurringFrequency"
                    label={t("newDistribution.recurringOptions.label")}
                    control={control}
                    options={recurringOptions}
                    isSearchable={false}
                  />
                </Stack>
                <Stack gap={2} w="full">
                  <DateField
                    name="recurringStartDate"
                    control={control}
                    label={t("newDistribution.startTime")}
                    placeholder={t("newDistribution.selectDateAndTime")}
                    isRequired
                    requiredMessage={t("newDistribution.validation.startDateRequired")}
                    futureDateMessage={t("newDistribution.validation.futureDateRequired")}
                  />
                </Stack>
              </>
            )}
            {distributionType === "automated" && (
              <Stack gap={2} w="full">
                <SelectController
                  id="triggerCondition"
                  name="triggerCondition"
                  control={control}
                  label={t("newDistribution.trigerCondition")}
                  placeholder="Select trigger condition"
                  options={triggerConditionOptions}
                  isRequired
                />
              </Stack>
            )}
          </Stack>
          <HStack w="full" pt={4} justifyContent="flex-end" gap={3}>
            <Button variant="secondary" onClick={() => navigate(`/assets/${id}`)} size="md">
              {t("newDistribution.buttons.cancel")}
            </Button>
            <Button
              variant="primary"
              isDisabled={!isFormValidResult}
              isLoading={createManualPayoutMutation.isPending}
              onClick={onOpen}
              size="md"
            >
              {t("newDistribution.buttons.createDistribution")}
            </Button>
          </HStack>
        </Stack>
        <PopUp
          isOpen={isOpen}
          onClose={handleClose}
          icon={<PhosphorIcon as={Warning} size="md" weight={Weight.Light} />}
          title={t("newDistribution.popup.title")}
          description={formatDistributionDescription(t, amount, amountType, formValues, assetData)}
          confirmText={t("newDistribution.popup.confirmText")}
          cancelText={t("newDistribution.popup.cancelText")}
          onConfirm={handleMakeNewDistribution}
          onCancel={onClose}
          variant="info"
          confirmButtonProps={{
            isDisabled: createManualPayoutMutation.isPending,
          }}
          cancelButtonProps={{
            isDisabled: createManualPayoutMutation.isPending,
          }}
          showCloseButton={!createManualPayoutMutation.isPending}
        />
      </Box>
    </Stack>
  );
};
