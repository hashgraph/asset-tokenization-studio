import { useEffect } from "react";
import { HStack, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import {
  PhosphorIcon,
  Text,
} from "@hashgraph/asset-tokenization-uicomponents/Foundations";
import { CancelButton } from "../../../components/CancelButton";
import { NextStepButton } from "./NextStepButton";
import { PreviousStepButton } from "./PreviousStepButton";
import {
  CalendarInputController,
  InputController,
  InputNumberController,
  Tooltip,
} from "@hashgraph/asset-tokenization-uicomponents";
import { required, isAfterDate, min } from "../../../utils/rules";
import { ICreateBondFormValues } from "../ICreateBondFormValues";
import { useFormContext, useFormState } from "react-hook-form";
import { FormStepContainer } from "../../../components/FormStepContainer";
import { formatNumber } from "../../../utils/format";
import { Info } from "@phosphor-icons/react";

export const StepConfiguration = () => {
  const { t } = useTranslation("security", { keyPrefix: "createBond" });
  const { control, watch, setValue, getValues } =
    useFormContext<ICreateBondFormValues>();
  const stepFormState = useFormState({ control });

  const today = new Date();
  const startingDate = watch("startingDate");
  const nominalValue = watch("nominalValue");
  const numberOfUnits = watch("numberOfUnits");
  const totalAmount = watch("totalAmount");
  const decimals = getValues("decimals");

  useEffect(() => {
    let totalAmount = 0;
    if (!isNaN(Number(nominalValue)) && !isNaN(Number(numberOfUnits))) {
      totalAmount = Number(nominalValue) * Number(numberOfUnits);
    }

    setValue("totalAmount", formatNumber(totalAmount, {}, 2));
  }, [nominalValue, numberOfUnits, setValue]);

  return (
    <FormStepContainer>
      <Stack gap={2}>
        <Text textStyle="HeadingMediumLG">{t("stepConfiguration.title")}</Text>
        <Text textStyle="BodyTextRegularMD">
          {t("stepConfiguration.subtitle")}
        </Text>
        <Text textStyle="ElementsRegularSM" mt={6}>
          {t("stepConfiguration.mandatoryFields")}
        </Text>
      </Stack>
      <Stack w="full">
        <Text textStyle="BodyTextRegularSM">
          {t("stepConfiguration.currency")}
        </Text>
        <InputController
          control={control}
          id="currency"
          defaultValue="USD"
          placeholder="USD"
          backgroundColor="neutral.600"
          size="md"
          isDisabled={true}
        />
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepConfiguration.numberOfUnits")}*
          </Text>
          <Tooltip
            label={t("stepConfiguration.numberOfUnitsTooltip")}
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <InputNumberController
          autoFocus
          control={control}
          id="numberOfUnits"
          rules={{
            required,
            min: min(0),
          }}
          decimalScale={decimals}
          fixedDecimalScale={true}
          placeholder={t("stepConfiguration.numberOfUnitsPlaceHolder")}
          backgroundColor="neutral.600"
          size="md"
          thousandSeparator=","
          decimalSeparator="."
        />
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepConfiguration.nominalValue")}*
          </Text>
          <Tooltip
            label={t("stepConfiguration.nominalValueTooltip")}
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <InputNumberController
          control={control}
          id="nominalValue"
          rules={{
            required,
            min: min(0),
          }}
          decimalScale={2}
          fixedDecimalScale={true}
          placeholder={t("stepConfiguration.nominalValuePlaceHolder")}
          backgroundColor="neutral.600"
          size="md"
          thousandSeparator=","
          decimalSeparator="."
        />
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepConfiguration.totalAmount")}*
          </Text>
          <Tooltip
            label={t("stepConfiguration.totalAmountTooltip")}
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <InputController
          control={control}
          id="totalAmount"
          value={totalAmount}
          defaultValue={totalAmount}
          rules={{ required }}
          backgroundColor="neutral.600"
          size="md"
          isDisabled={true}
        />
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepConfiguration.startingDate")}*
          </Text>
          <Tooltip
            label={t("stepConfiguration.startingDateTooltip")}
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <CalendarInputController
          control={control}
          fromDate={new Date(today.setHours(today.getHours() + 24))}
          id="startingDate"
          rules={{
            required,
          }}
          placeholder={t("stepConfiguration.startingDatePlaceHolder")}
          backgroundColor="neutral.600"
          size="md"
        />
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepConfiguration.maturityDate")}*
          </Text>
          <Tooltip
            label={t("stepConfiguration.maturityDateTooltip")}
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <CalendarInputController
          control={control}
          id="maturityDate"
          rules={{
            required,
            validate: isAfterDate(new Date(startingDate)),
          }}
          placeholder={t("stepConfiguration.maturityDatePlaceHolder")}
          backgroundColor="neutral.600"
          size="md"
        />
      </Stack>
      <HStack
        gap={4}
        w="full"
        h="100px"
        align="end"
        justifyContent={"flex-end"}
      >
        <CancelButton />
        <PreviousStepButton />
        <NextStepButton isDisabled={!stepFormState.isValid} />
      </HStack>
    </FormStepContainer>
  );
};
