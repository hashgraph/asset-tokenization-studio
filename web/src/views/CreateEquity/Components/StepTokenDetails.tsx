import {
  FormControl,
  HStack,
  SimpleGrid,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Info } from "@phosphor-icons/react";
import { InfoDivider, PhosphorIcon, Tooltip } from "@iob/io-bricks-ui";

import { Text } from "@iob/io-bricks-ui/Foundations";
import {
  InputController,
  InputNumberController,
  ToggleController,
} from "@iob/io-bricks-ui/Forms/Controllers";
import {
  greaterOrEqualThan,
  isISINValid,
  lowerOrEqualThan,
  maxLength,
  required,
} from "../../../utils/rules";
import { useFormContext, useFormState } from "react-hook-form";
import { ICreateEquityFormValues } from "../ICreateEquityFormValues";
import { CancelButton } from "../../../components/CancelButton";
import { NextStepButton } from "./NextStepButton";
import { FormStepContainer } from "../../../components/FormStepContainer";

export const StepTokenDetails = () => {
  const { t } = useTranslation("security", { keyPrefix: "createEquity" });

  const { control, setValue } = useFormContext<ICreateEquityFormValues>();

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
      <InfoDivider
        title={t("stepTokenDetails.generalInformation")}
        type="main"
      />
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
      <InfoDivider title={t("stepTokenDetails.tokenPermissions")} type="main" />
      <VStack w="full">
        <FormControl gap="15px" as={SimpleGrid} columns={{ base: 3, lg: 1 }}>
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
      </VStack>
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
