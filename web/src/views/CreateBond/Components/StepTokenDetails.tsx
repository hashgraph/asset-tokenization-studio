import { FormControl, HStack, SimpleGrid, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Info } from "@phosphor-icons/react";
import { PhosphorIcon, Tooltip } from "@hashgraph/assettokenization-uicomponents";
import { Text } from "@hashgraph/assettokenization-uicomponents/Foundations";
import {
  InputController,
  InputNumberController,
  ToggleController,
} from "@hashgraph/assettokenization-uicomponents/Forms/Controllers";
import {
  greaterOrEqualThan,
  isISINValid,
  lowerOrEqualThan,
  maxLength,
  required,
} from "../../../utils/rules";
import { useFormContext, useFormState } from "react-hook-form";
import { ICreateBondFormValues } from "../ICreateBondFormValues";
import { CancelButton } from "../../../components/CancelButton";
import { NextStepButton } from "./NextStepButton";
import { FormStepContainer } from "../../../components/FormStepContainer";

export const StepTokenDetails = () => {
  const { t } = useTranslation("security", { keyPrefix: "createBond" });

  const { control, setValue } = useFormContext<ICreateBondFormValues>();

  const stepFormState = useFormState({
    control,
  });

  return (
    <FormStepContainer>
      <Stack gap={2}>
        <Text textStyle="HeadingMediumLG">{t("stepTokenDetails.title")}</Text>
        <Text textStyle="BodyTextRegularMD">
          {t("stepTokenDetails.subtitle")}
        </Text>
        <Text textStyle="ElementsRegularSM" mt={6}>
          {t("stepTokenDetails.mandatoryFields")}
        </Text>
      </Stack>
      <Text textStyle="HeadingMediumMD">
        {t("stepTokenDetails.generalInformation")}
      </Text>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepTokenDetails.name")}*
          </Text>
          <Tooltip label={t("stepTokenDetails.nameTooltip")} placement="right">
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <InputController
          autoFocus
          control={control}
          id="name"
          rules={{ required, maxLength: maxLength(100) }}
          placeholder={t("stepTokenDetails.placeholderName")}
          backgroundColor="neutral.600"
          size="md"
        />
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepTokenDetails.symbol")}*
          </Text>
          <Tooltip
            label={t("stepTokenDetails.symbolTooltip")}
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <InputController
          id="symbol"
          control={control}
          placeholder={t("stepTokenDetails.placeholderSymbol")}
          backgroundColor="neutral.600"
          size="md"
          rules={{ required, maxLength: maxLength(100) }}
        />
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepTokenDetails.decimals")}*
          </Text>
          <Tooltip
            label={t("stepTokenDetails.decimalsTooltip")}
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <InputNumberController
          id="decimals"
          control={control}
          placeholder={t("stepTokenDetails.placeholderDecimals")}
          backgroundColor="neutral.600"
          size="md"
          rules={{
            required,
            min: 0,
            validate: {
              lowerOrEqualThan: lowerOrEqualThan(18),
              greaterThan: greaterOrEqualThan(0),
            },
          }}
        />
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepTokenDetails.isin")}*
          </Text>
          <Tooltip label={t("stepTokenDetails.isinTooltip")} placement="right">
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <InputController
          id="isin"
          control={control}
          placeholder={t("stepTokenDetails.placeholderIsin")}
          backgroundColor="neutral.600"
          size="md"
          rules={{
            required,
            validate: isISINValid(12),
          }}
        />
      </Stack>
      <Stack w="full" gap={6}>
        <Text textStyle="HeadingMediumMD">
          {t("stepTokenDetails.bondPermissions")}
        </Text>
        <FormControl gap={6} as={SimpleGrid} columns={{ base: 3, lg: 1 }}>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isControllable"
              label={t("stepTokenDetails.permissionControllable")}
            />
            <Tooltip
              label={t("stepTokenDetails.permissionControllableTooltip")}
              placement="right"
            >
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isBlocklist"
              label={t("stepTokenDetails.permissionBlocklist")}
              onChange={(e) => setValue("isApproval", !e.target.checked)}
            />
            <Tooltip
              label={t("stepTokenDetails.permissionBlocklistTooltip")}
              placement="right"
            >
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isApproval"
              label={t("stepTokenDetails.permissionApprovalList")}
              onChange={(e) => setValue("isBlocklist", !e.target.checked)}
            />
            <Tooltip
              label={t("stepTokenDetails.permissionApprovalListTooltip")}
              placement="right"
            >
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
        </FormControl>
      </Stack>

      <HStack
        gap={4}
        w="full"
        h="100px"
        align="end"
        justifyContent={"flex-end"}
      >
        <CancelButton />
        <NextStepButton isDisabled={!stepFormState.isValid} />
      </HStack>
    </FormStepContainer>
  );
};
