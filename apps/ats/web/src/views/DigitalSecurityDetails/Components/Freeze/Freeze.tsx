// SPDX-License-Identifier: Apache-2.0
import { useWatch } from "react-hook-form";
import { HStack, Stack, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import {
  Text,
  InputController,
  InputNumberController,
  Button,
  ToggleController,
  Tooltip,
  PhosphorIcon,
} from "io-bricks-ui";
import { SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router";
import { Info } from "@phosphor-icons/react";
import { UnfreezePartialTokensRequest, FreezePartialTokensRequest } from "@hashgraph/asset-tokenization-sdk";
import { useSecurityStore } from "../../../../store/securityStore";
import { CancelButton } from "../../../../components/CancelButton";
import { min, required } from "../../../../utils/rules";
import { useFreezeSecurity, useUnfreezeSecurity } from "../../../../hooks/mutations/useFreezeSecurity";

interface MintFormValues {
  amount: number;
  destination: string;
  isUnfreeze: boolean;
}

export const Freeze = () => {
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "freeze.input",
  });
  const { t } = useTranslation("security", { keyPrefix: "freeze" });
  const { t: tGlobal } = useTranslation("globals");
  const { control, formState, handleSubmit, reset } = useForm<MintFormValues>({
    mode: "onChange",
  });

  const { id = "" } = useParams();
  const { details } = useSecurityStore();

  const { mutate: freezeSecurity, isLoading: isFreezeLoading } = useFreezeSecurity();
  const { mutate: unfreezeSecurity, isLoading: isUnfreezeLoading } = useUnfreezeSecurity();

  const isUnfreeze = useWatch({
    control,
    name: "isUnfreeze",
    defaultValue: false,
  });

  const submit: SubmitHandler<MintFormValues> = (params) => {
    const isUnfreeze = params.isUnfreeze;

    if (isUnfreeze) {
      const unfreezePartialTokensRequest = new UnfreezePartialTokensRequest({
        securityId: id,
        targetId: params.destination,
        amount: params.amount.toString(),
      });

      unfreezeSecurity(unfreezePartialTokensRequest, {
        onSuccess: () => {
          reset();
        },
      });
    } else {
      const freezePartialTokensRequest = new FreezePartialTokensRequest({
        securityId: id,
        targetId: params.destination,
        amount: params.amount.toString(),
      });

      freezeSecurity(freezePartialTokensRequest, {
        onSuccess: () => {
          reset();
        },
      });
    }
  };

  return (
    <>
      <HStack layerStyle="container" pt={10} pb={10} gap={20} justify="center">
        <VStack
          data-testid="mint-form"
          justifyContent="flex-start"
          h="full"
          alignItems="flex-start"
          w="full"
          maxW="472px"
          as="form"
          onSubmit={handleSubmit(submit)}
          gap={3}
        >
          <Text textStyle="HeadingMediumLG">{t("title")}</Text>
          <Text textStyle="BodyRegularMD" mt={2}>
            {t("subtitle")}
          </Text>
          <Text textStyle="ElementsRegularSM" mt={8}>
            {tGlobal("mandatoryFields")}
          </Text>
          <VStack>
            <Tooltip label={tForm("isUnfreeze.tooltip")} placement="right">
              <HStack>
                <Text>{tForm("isUnfreeze.label")}</Text>
                <PhosphorIcon as={Info} />
              </HStack>
            </Tooltip>
            <ToggleController control={control} id="isUnfreeze" />
          </VStack>
          <Stack mt={6} w="full">
            <InputNumberController
              autoFocus
              control={control}
              id="amount"
              rules={{
                required,
                min: min(0),
              }}
              size="md"
              allowNegative={false}
              label={tForm(isUnfreeze ? "amountUnfreeze.label" : "amountFreeze.label")}
              placeholder={tForm(isUnfreeze ? "amountUnfreeze.placeholder" : "amountFreeze.placeholder")}
              decimalScale={details?.decimals}
              fixedDecimalScale={true}
              thousandSeparator=","
              decimalSeparator="."
            />
          </Stack>
          <Stack mt={6} w="full">
            <InputController
              autoFocus
              control={control}
              id="destination"
              rules={{ required }}
              label={tForm("destination.label")}
              placeholder={tForm("destination.placeholder")}
              size="md"
            />
          </Stack>
          <HStack gap={4} w="full" mt={10} align="end" justifyContent={"flex-end"}>
            <CancelButton />
            <Button
              data-testid="mint-security-button"
              size="md"
              variant="primary"
              isDisabled={!formState.isValid}
              type="submit"
              minW="unset"
              isLoading={isFreezeLoading || isUnfreezeLoading}
            >
              {tGlobal("submit")}
            </Button>
          </HStack>
        </VStack>
      </HStack>
    </>
  );
};
