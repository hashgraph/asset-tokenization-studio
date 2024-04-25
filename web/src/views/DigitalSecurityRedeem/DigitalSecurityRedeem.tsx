import { HStack, Stack, VStack } from "@chakra-ui/react";
import { History } from "../../components/History";
import { useTranslation } from "react-i18next";
import { Text } from "@hashgraph/uiComponents/Foundations";
import { InputNumberController } from "@hashgraph/uiComponents/Forms/Controllers";
import { SubmitHandler, useForm } from "react-hook-form";
import { required, min } from "../../utils/rules";
import { Button } from "@hashgraph/uiComponents";
import { CancelButton } from "../../components/CancelButton";
import { useParams } from "react-router";
import { useRedeemSecurity } from "../../hooks/queries/useRedeemSecurity";
import { RedeemRequest } from "@hashgraph/securitytoken-sdk";
import { DetailsBalancePanel } from "../../components/DetailsBalancePanel";
import { useDetailsBalancePanel } from "../../hooks/useDetailsBalancePanel";
import { useWalletStore } from "../../store/walletStore";
import { useSecurityStore } from "../../store/securityStore";

interface RedeemFormValues {
  amount: number;
}

export const DigitalSecurityRedeem = () => {
  const { t: tHeader } = useTranslation("security", {
    keyPrefix: "redeem.header",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "redeem.input",
  });
  const { t } = useTranslation("security", { keyPrefix: "redeem" });
  const { t: tGlobal } = useTranslation("globals");
  const { control, formState, handleSubmit, reset } = useForm<RedeemFormValues>(
    {
      mode: "all",
    },
  );
  const { t: TButton } = useTranslation("security", {
    keyPrefix: "redeem.button",
  });
  const { id = "" } = useParams();
  const { details } = useSecurityStore();
  const { address: walletAddress } = useWalletStore();

  const { currentAvailableBalance, isCurrentAvailableBalanceLoading, update } =
    useDetailsBalancePanel(id, walletAddress);

  const { mutate: redeemSecurity, isLoading } = useRedeemSecurity({
    onSettled: () => update(),
    onSuccess: () => {
      reset();
    },
  });

  const submit: SubmitHandler<RedeemFormValues> = (params) => {
    const request = new RedeemRequest({
      securityId: id,
      amount: params.amount.toString(),
    });

    redeemSecurity(request);
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
          data-testid="redeem-form"
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
          isLoading={isCurrentAvailableBalanceLoading}
        />
      </HStack>
    </>
  );
};
