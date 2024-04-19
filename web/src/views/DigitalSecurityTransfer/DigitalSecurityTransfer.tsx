import { HStack, Stack, VStack } from "@chakra-ui/react";
import { History } from "../../components/History";
import { useTranslation } from "react-i18next";
import { Text } from "@iob/io-bricks-ui/Foundations";
import {
  InputController,
  InputNumberController,
} from "@iob/io-bricks-ui/Forms/Controllers";
import { SubmitHandler, useForm } from "react-hook-form";
import { required, min } from "../../utils/rules";
import { Button } from "@iob/io-bricks-ui";
import { CancelButton } from "../../components/CancelButton";
import { useTransferSecurity } from "../../hooks/queries/useTransferSecurity";
import { TransferRequest } from "@iob/securitytoken-sdk";
import { useParams } from "react-router";
import { DetailsBalancePanel } from "../../components/DetailsBalancePanel";
import { useWalletStore } from "../../store/walletStore";
import { useDetailsBalancePanel } from "../../hooks/useDetailsBalancePanel";
import { useSecurityStore } from "../../store/securityStore";

interface TransferFormValues {
  amount: number;
  destination: string;
}

export const DigitalSecurityTransfer = () => {
  const { t: tHeader } = useTranslation("security", {
    keyPrefix: "transfer.header",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "transfer.input",
  });
  const { t } = useTranslation("security", { keyPrefix: "transfer" });
  const { t: tGlobal } = useTranslation("globals");
  const { control, formState, handleSubmit, reset } =
    useForm<TransferFormValues>({
      mode: "all",
    });
  const { t: TButton } = useTranslation("security", {
    keyPrefix: "transfer.button",
  });
  const { id = "" } = useParams();
  const { details } = useSecurityStore();
  const { address: walletAddress } = useWalletStore();

  const { currentAvailableBalance, isCurrentAvailableBalanceLoading, update } =
    useDetailsBalancePanel(id, walletAddress);

  const { mutate: transferSecurity, isLoading } = useTransferSecurity({
    onSettled: () => update(),
    onSuccess: () => {
      reset();
    },
  });

  const submit: SubmitHandler<TransferFormValues> = (params) => {
    const request = new TransferRequest({
      securityId: id,
      targetId: params.destination,
      amount: params.amount.toString(),
    });

    transferSecurity(request);
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
          data-testid="transfer-form"
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
