// SPDX-License-Identifier: Apache-2.0

import { FormControl, HStack, SimpleGrid, Stack, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { InfoDivider, InputController, Text } from "io-bricks-ui";
import { useFormContext, useFormState } from "react-hook-form";
import { ICreateEquityFormValues } from "../CreateEquity/ICreateEquityFormValues";
import { ICreateBondFormValues } from "../CreateBond/ICreateBondFormValues";
import { FormStepContainer } from "../../components/FormStepContainer";
import { CancelButton } from "../../components/CancelButton";
import { PreviousStepButton } from "../CreateEquity/Components/PreviousStepButton";
import { NextStepButton } from "../CreateEquity/Components/NextStepButton";
import { isValidHederaId } from "../../utils/rules";

export const StepERC3643 = () => {
  const { t } = useTranslation("security", {
    keyPrefix: "createEquity.stepERC3643",
  });

  const { control } = useFormContext<ICreateEquityFormValues | ICreateBondFormValues>();

  const { errors, isSubmitting } = useFormState({
    control,
  });

  // Can proceed if there are no validation errors and the form isn't submitting
  const canProceed = Object.keys(errors ?? {}).length === 0 && !isSubmitting;

  return (
    <FormStepContainer>
      <Stack gap={2}>
        <Text textStyle="HeadingMediumLG">{t("title")}</Text>
        <Text textStyle="BodyTextRegularMD">{t("subtitle")}</Text>
      </Stack>

      <InfoDivider title={t("compliance")} type="main" />
      <VStack w="full">
        <FormControl gap={4} as={SimpleGrid} columns={{ base: 7, lg: 1 }}>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{t("complianceId")}</Text>
            </HStack>
            <InputController
              control={control}
              id="complianceId"
              rules={{
                validate: (value: string) => !value || isValidHederaId(value) || t("invalidHederaId"),
              }}
              placeholder={t("complianceIdPlaceholder")}
            />
          </Stack>
        </FormControl>
      </VStack>

      <InfoDivider title={t("identityRegistry")} type="main" />
      <VStack w="full">
        <FormControl gap={4} as={SimpleGrid} columns={{ base: 7, lg: 1 }}>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{t("identityRegistryId")}</Text>
            </HStack>
            <InputController
              control={control}
              id="identityRegistryId"
              rules={{
                validate: (value: string) => !value || isValidHederaId(value) || t("invalidHederaId"),
              }}
              placeholder={t("identityRegistryIdPlaceholder")}
            />
          </Stack>
        </FormControl>
      </VStack>

      <HStack gap={4} w="full" h="100px" align="end" justifyContent={"flex-end"}>
        <CancelButton />
        <PreviousStepButton />
        <NextStepButton isDisabled={!canProceed} />
      </HStack>
    </FormStepContainer>
  );
};
