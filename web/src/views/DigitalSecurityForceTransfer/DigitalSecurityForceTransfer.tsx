import { HStack, Stack, VStack } from "@chakra-ui/react";
import { History } from "../../components/History";
import { useTranslation } from "react-i18next";
import { Text } from "@hashgraph/asset-tokenization-uicomponents/Foundations";
import {
  InputController,
  InputNumberController,
} from "@hashgraph/asset-tokenization-uicomponents/Forms/Controllers";
import { SubmitHandler, useForm } from "react-hook-form";
import { required, min } from "../../utils/rules";
import { Button } from "@hashgraph/asset-tokenization-uicomponents";
import { CancelButton } from "../../components/CancelButton";
import { ForceTransferRequest } from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router";
import { useForceTransferSecurity } from "../../hooks/queries/useForceTransferSecurity";
import { DetailsBalancePanel } from "../../components/DetailsBalancePanel";
import { useWalletStore } from "../../store/walletStore";
import { useDetailsBalancePanel } from "../../hooks/useDetailsBalancePanel";
import { useSecurityStore } from "../../store/securityStore";

interface ForceTransferFormValues {
  source: string;
  amount: number;
  destination: string;
}

export const DigitalSecurityForceTransfer = () => {
  const { t: tHeader } = useTranslation("security", {
    keyPrefix: "forceTransfer.header",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "forceTransfer.input",
  });
  const { t } = useTranslation("security", { keyPrefix: "forceTransfer" });
  const { t: tGlobal } = useTranslation("globals");
  const { control, formState, handleSubmit, reset } =
    useForm<ForceTransferFormValues>({ mode: "all" });
  const { t: tButton } = useTranslation("security", {
    keyPrefix: "forceTransfer.button",
  });
  const { id = "" } = useParams();
  const { details } = useSecurityStore();
  const { address: walletAddress } = useWalletStore();

  const {
    currentAvailableBalance,
    isLoading: isBalancePanelLoading,
    update,
  } = useDetailsBalancePanel(id, walletAddress);

  const { mutate: forceTransferSecurity, isLoading } = useForceTransferSecurity(
    {
      onSettled: () => update(),
      onSuccess: () => {
        reset();
      },
    },
  );

  const submit: SubmitHandler<ForceTransferFormValues> = (params) => {
    const request = new ForceTransferRequest({
      securityId: id,
      sourceId: params.source,
      targetId: params.destination,
      amount: params.amount.toString(),
    });

    forceTransferSecurity(request);
  };

  return (
    <>
      <History label={tHeader("title")} />
      <HStack
        layerStyle="container"
        mt={6}
        pt={20}
        pb={8}
        gap={20}
        justify="center"
      >
        <VStack
          data-testid="force-transfer-form"
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
          <HStack
            gap={4}
            w="full"
            mt={10}
            align="end"
            justifyContent={"flex-end"}
          >
            <CancelButton />
            <Button
              data-testid="transfer-security-button"
              size="md"
              variant="primary"
              isDisabled={!formState.isValid}
              type="submit"
              minW="unset"
              isLoading={isLoading}
            >
              {tButton("accept")}
            </Button>
          </HStack>
        </VStack>
        <DetailsBalancePanel
          balance={currentAvailableBalance?.value}
          isLoading={isBalancePanelLoading}
        />
      </HStack>
    </>
  );
};
