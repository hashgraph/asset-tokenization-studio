//SPDX-License-Identifier: Apache-2.0

import { HStack, Stack, VStack } from "@chakra-ui/react";
import { History } from "../../components/History";
import { useTranslation } from "react-i18next";
import { Text, InputController, InputNumberController, Button, Checkbox } from "io-bricks-ui";
import { SubmitHandler, useForm } from "react-hook-form";
import { required, min } from "../../utils/rules";
import { CancelButton } from "../../components/CancelButton";
import { useParams } from "react-router";
import { ForceRedeemRequest, FullRedeemAtMaturityRequest } from "@hashgraph/asset-tokenization-sdk";
import { useForceRedeemSecurity } from "../../hooks/queries/useForceRedeemSecurity";
import { useFullRedeemAtMaturity } from "../../hooks/queries/useFullRedeemAtMaturity";
import { DetailsBalancePanel } from "../../components/DetailsBalancePanel";
import { useWalletStore } from "../../store/walletStore";
import { useDetailsBalancePanel } from "../../hooks/useDetailsBalancePanel";
import { useSecurityStore } from "../../store/securityStore";

interface ForceRedeemFormValues {
  source: string;
  amount: number;
  fullRedeem: boolean;
}

export const DigitalSecurityForceRedeem = () => {
  const { t: tHeader } = useTranslation("security", {
    keyPrefix: "forceRedeem.header",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "forceRedeem.input",
  });
  const { t } = useTranslation("security", { keyPrefix: "forceRedeem" });
  const { t: tGlobal } = useTranslation("globals");
  const { control, handleSubmit, reset, watch } = useForm<ForceRedeemFormValues>({
    mode: "all",
    defaultValues: {
      fullRedeem: false,
    },
  });
  const { t: TButton } = useTranslation("security", {
    keyPrefix: "forceRedeem.button",
  });
  const { t: TCheckbox } = useTranslation("security", {
    keyPrefix: "forceRedeem.checkbox",
  });
  const { id = "" } = useParams();
  const { details } = useSecurityStore();
  const { address: walletAddress } = useWalletStore();

  const {
    currentAvailableBalance,
    isLoading: isBalancePanelLoading,
    update,
  } = useDetailsBalancePanel(id, walletAddress);

  const { mutate: forceRedeemSecurity, isLoading } = useForceRedeemSecurity({
    onSettled: () => update(),
    onSuccess: () => {
      reset();
    },
  });

  const { mutate: fullRedeemAtMaturity, isLoading: isLoadingFullRedeem } = useFullRedeemAtMaturity({
    onSettled: () => update(),
    onSuccess: () => {
      reset();
    },
  });

  const isFullRedeem = watch("fullRedeem");
  const sourceValue = watch("source");
  const amountValue = watch("amount");

  const submit: SubmitHandler<ForceRedeemFormValues> = (params) => {
    if (params.fullRedeem) {
      const request = new FullRedeemAtMaturityRequest({
        securityId: id,
        sourceId: params.source,
      });
      fullRedeemAtMaturity(request);
    } else {
      const request = new ForceRedeemRequest({
        securityId: id,
        sourceId: params.source,
        amount: params.amount.toString(),
      });
      forceRedeemSecurity(request);
    }
  };

  const isFormValid = !!sourceValue && (isFullRedeem || !!amountValue);

  return (
    <>
      <History label={tHeader("title")} />
      <HStack layerStyle="container" mt={6} pt={20} pb={8} gap={20} justify="center">
        <VStack
          data-testid="force-redeem-form"
          justifyContent="flex-start"
          h="full"
          alignItems="flex-start"
          w="full"
          maxW="472px"
          as="form"
          onSubmit={handleSubmit(submit)}
        >
          <Text textStyle="HeadingMediumLG">{t("title")}</Text>
          <Text textStyle="BodyRegularMD" mt={2}>
            {t("subtitle")}
          </Text>
          <Text textStyle="ElementsRegularSM" mt={8}>
            {tGlobal("mandatoryFields")}
          </Text>
          <Stack mt={6} w="full">
            <InputController
              autoFocus
              control={control}
              id="source"
              rules={{ required }}
              label={tForm("source.label")}
              placeholder={tForm("source.placeholder")}
              size="md"
            />
          </Stack>
          <Stack mt={6} w="full">
            <InputNumberController
              control={control}
              id="amount"
              rules={{
                required: !isFullRedeem ? required : false,
                min: !isFullRedeem ? min(0) : undefined,
              }}
              size="md"
              allowNegative={false}
              label={tForm("amount.label")}
              placeholder={tForm("amount.placeholder")}
              decimalScale={details?.decimals}
              fixedDecimalScale={true}
              thousandSeparator=","
              decimalSeparator="."
              isDisabled={isFullRedeem}
            />
          </Stack>
          <Stack mt={4} w="full">
            <Checkbox
              id="fullRedeem"
              isChecked={isFullRedeem}
              onChange={(e) => {
                const checked = e.target.checked;
                reset({ ...watch(), fullRedeem: checked, amount: checked ? 0 : watch("amount") });
              }}
            >
              <Text color="neutral.600">{TCheckbox("label")}</Text>
            </Checkbox>
          </Stack>
          <HStack gap={4} w="full" mt={10} align="end" justifyContent={"flex-end"}>
            <CancelButton />
            <Button
              data-testid="redeem-security-button"
              size="md"
              variant="primary"
              isDisabled={!isFormValid}
              type="submit"
              minW="unset"
              isLoading={isLoading || isLoadingFullRedeem}
            >
              {TButton("accept")}
            </Button>
          </HStack>
        </VStack>
        <DetailsBalancePanel balance={currentAvailableBalance?.value} isLoading={isBalancePanelLoading} />
      </HStack>
    </>
  );
};
