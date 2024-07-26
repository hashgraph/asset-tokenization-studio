import { HStack, Stack, VStack } from "@chakra-ui/react";
import { History } from "../../components/History";
import { useTranslation } from "react-i18next";
import { Text } from "@hashgraph/assettokenization-uicomponents/Foundations";
import {
  InputController,
  InputNumberController,
} from "@hashgraph/assettokenization-uicomponents/Forms/Controllers";
import { SubmitHandler, useForm } from "react-hook-form";
import { required, min } from "../../utils/rules";
import { Button } from "@hashgraph/assettokenization-uicomponents";
import { CancelButton } from "../../components/CancelButton";
import { useParams } from "react-router";
import { ForceRedeemRequest } from "@hashgraph/assettokenization-sdk";
import { useForceRedeemSecurity } from "../../hooks/queries/useForceRedeemSecurity";
import { DetailsBalancePanel } from "../../components/DetailsBalancePanel";
import { useWalletStore } from "../../store/walletStore";
import { useDetailsBalancePanel } from "../../hooks/useDetailsBalancePanel";
import { useSecurityStore } from "../../store/securityStore";

interface ForceRedeemFormValues {
  source: string;
  amount: number;
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
  const { control, formState, handleSubmit, reset } =
    useForm<ForceRedeemFormValues>({
      mode: "all",
    });
  const { t: TButton } = useTranslation("security", {
    keyPrefix: "forceRedeem.button",
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

  const submit: SubmitHandler<ForceRedeemFormValues> = (params) => {
    const request = new ForceRedeemRequest({
      securityId: id,
      sourceId: params.source,
      amount: params.amount.toString(),
    });

    forceRedeemSecurity(request);
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
              data-testid="redeem-security-button"
              size="md"
              variant="primary"
              isDisabled={!formState.isValid}
              type="submit"
              minW="unset"
              isLoading={isLoading}
            >
              {TButton("accept")}
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
