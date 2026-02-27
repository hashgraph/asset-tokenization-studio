// SPDX-License-Identifier: Apache-2.0

import { HStack, Stack, VStack } from "@chakra-ui/react";
import { History } from "../../components/History";
import { useTranslation } from "react-i18next";
import { Text, InputController, InputNumberController, Button } from "io-bricks-ui";
import { SubmitHandler, useForm } from "react-hook-form";
import { required, min } from "../../utils/rules";
import { CancelButton } from "../../components/CancelButton";
import { useParams } from "react-router";
import { IssueRequest } from "@hashgraph/asset-tokenization-sdk";
import { useMintSecurity } from "../../hooks/queries/useMintSecurity";
import { DetailsBalancePanel } from "../../components/DetailsBalancePanel";
import { useDetailsBalancePanel } from "../../hooks/useDetailsBalancePanel";
import { useWalletStore } from "../../store/walletStore";
import { useSecurityStore } from "../../store/securityStore";

interface MintFormValues {
  amount: number;
  destination: string;
}

export const DigitalSecurityMint = () => {
  const { t: tHeader } = useTranslation("security", {
    keyPrefix: "mint.header",
  });
  const { t: tForm } = useTranslation("security", { keyPrefix: "mint.input" });
  const { t } = useTranslation("security", { keyPrefix: "mint" });
  const { t: tGlobal } = useTranslation("globals");
  const { t: tProperties } = useTranslation("properties");
  const { control, formState, handleSubmit, reset } = useForm<MintFormValues>({
    mode: "all",
  });
  const { address: walletAddress } = useWalletStore();
  const { id = "" } = useParams<{ id: string }>();
  const { details } = useSecurityStore();
  const { isLoading: isBalancePanelLoading, update } = useDetailsBalancePanel(id, walletAddress);
  const { mutate: mintSecurity, isLoading } = useMintSecurity();

  const submit: SubmitHandler<MintFormValues> = (params) => {
    const request = new IssueRequest({
      securityId: id,
      targetId: params.destination,
      amount: params.amount.toString(),
    });

    mintSecurity(request, {
      onSettled: () => update(),
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <>
      <History label={tHeader("title")} />
      <HStack layerStyle="container" mt={6} pt={20} pb={8} gap={20} justify="center">
        <VStack
          data-testid="mint-form"
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
              label={tForm("amount.label")}
              placeholder={tForm("amount.placeholder")}
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
              isLoading={isLoading}
            >
              {tGlobal("submit")}
            </Button>
          </HStack>
        </VStack>
        <DetailsBalancePanel
          balance={details?.totalSupply}
          isLoading={isBalancePanelLoading}
          title={tProperties("totalSupply")}
        />
      </HStack>
    </>
  );
};
