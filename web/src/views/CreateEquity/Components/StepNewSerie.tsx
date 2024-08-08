import {
  FormControl,
  HStack,
  SimpleGrid,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { Trans, useTranslation } from "react-i18next";
import { Info } from "@phosphor-icons/react";
import {
  PhosphorIcon,
  Text,
} from "@hashgraph/asset-tokenization-uicomponents/Foundations";
import { CancelButton } from "../../../components/CancelButton";
import { NextStepButton } from "./NextStepButton";
import { PreviousStepButton } from "./PreviousStepButton";
import {
  InfoDivider,
  InputController,
  InputNumberController,
  SelectController,
  ToggleController,
  Tooltip,
} from "@hashgraph/asset-tokenization-uicomponents";
import { greaterThan, min, required } from "../../../utils/rules";
import { ICreateEquityFormValues } from "../ICreateEquityFormValues";
import { useFormContext, useFormState } from "react-hook-form";
import { useEffect } from "react";
import { DividendType } from "../DividendType";
import { FormStepContainer } from "../../../components/FormStepContainer";
import { formatNumber } from "../../../utils/format";

export const StepNewSerie = () => {
  const { t } = useTranslation("security", { keyPrefix: "createEquity" });

  const { control, watch, setValue, getValues } =
    useFormContext<ICreateEquityFormValues>();

  const stepFormState = useFormState({
    control,
  });

  const nominalValue = watch("nominalValue");
  const numberOfShares = watch("numberOfShares");
  const totalAmount = watch("totalAmount");
  const decimals = getValues("decimals");

  useEffect(() => {
    let totalAmount = 0;
    if (!isNaN(Number(nominalValue)) && !isNaN(Number(numberOfShares))) {
      totalAmount = Number(nominalValue) * Number(numberOfShares);
    }
    setValue("totalAmount", formatNumber(totalAmount, {}, 2));
  }, [nominalValue, numberOfShares, setValue]);

  return (
    <FormStepContainer>
      <Stack gap={2}>
        <Text textStyle="HeadingMediumLG">{t("stepNewSerie.title")}</Text>
        <Text textStyle="BodyTextRegularMD">{t("stepNewSerie.subtitle")}</Text>
        <Text textStyle="ElementsRegularSM" mt={6}>
          {t("stepNewSerie.mandatoryFields")}
        </Text>
      </Stack>
      <InfoDivider title={t("stepNewSerie.economicInformation")} type="main" />
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepNewSerie.nominalValue")}*
          </Text>
          <Tooltip
            label={t("stepNewSerie.nominalValueTooltip")}
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <InputNumberController
          autoFocus
          control={control}
          id="nominalValue"
          rules={{
            required,
            min: min(0),
          }}
          decimalScale={2}
          fixedDecimalScale={true}
          placeholder={t("stepNewSerie.nominalValuePlaceHolder")}
          backgroundColor="neutral.600"
          size="md"
          thousandSeparator=","
          decimalSeparator="."
        />
      </Stack>
      <Stack w="full">
        <Text textStyle="BodyTextRegularSM">{t("stepNewSerie.currency")}</Text>
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
            {t("stepNewSerie.numberOfShares")}*
          </Text>
          <Tooltip
            label={t("stepNewSerie.numberOfSharesTooltip")}
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <InputNumberController
          autoFocus
          control={control}
          id="numberOfShares"
          rules={{
            required,
            validate: greaterThan(0),
          }}
          decimalScale={decimals}
          fixedDecimalScale={true}
          placeholder="200.000"
          backgroundColor="neutral.600"
          size="md"
          thousandSeparator=","
          decimalSeparator="."
        />
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepNewSerie.totalAmount")}*
          </Text>
          <Tooltip
            label={t("stepNewSerie.totalAmountTooltip")}
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
      <InfoDivider title={t("stepNewSerie.rightsAndPrivileges")} type="main" />
      <VStack w="full">
        <FormControl gap={4} as={SimpleGrid} columns={{ base: 7, lg: 1 }}>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isVotingRight"
              label={t("stepNewSerie.votingRights")}
            />
          </HStack>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isInformationRight"
              label={t("stepNewSerie.informationRights")}
            />
          </HStack>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isLiquidationRight"
              label={t("stepNewSerie.liquidationRights")}
            />
          </HStack>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isConversionRight"
              label={t("stepNewSerie.conversionRights")}
            />
          </HStack>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isSubscriptionRight"
              label={t("stepNewSerie.subscriptionRights")}
            />
          </HStack>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isRedemptionRight"
              label={t("stepNewSerie.redemptionRights")}
            />
          </HStack>
          <HStack justifySelf="flex-start">
            <ToggleController
              control={control}
              id="isPutRight"
              label={t("stepNewSerie.putRights")}
            />
          </HStack>
        </FormControl>
      </VStack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepNewSerie.dividendType")}*
          </Text>
          <Tooltip
            label={
              <Trans i18nkey="stepNewSerie.dividendTypeTooltip">
                {t("stepNewSerie.dividendTypeTooltip")}
              </Trans>
            }
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <SelectController
          control={control}
          id="dividendType"
          rules={{ required }}
          defaultValue={2}
          options={[
            {
              label: DividendType.NONE,
              value: "0",
            },
            {
              label: DividendType.PREFERRED,
              value: "1",
            },
            {
              label: DividendType.COMMON,
              value: "2",
            },
          ]}
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
