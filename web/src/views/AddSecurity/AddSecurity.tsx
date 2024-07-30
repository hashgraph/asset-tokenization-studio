import { HStack, Stack, VStack } from "@chakra-ui/react";
import {
  Heading,
  Text,
} from "@hashgraph/assettokenization-uicomponents/Foundations";
import { useTranslation } from "react-i18next";
import { RouteName } from "../../router/RouteName";
import { InputController } from "@hashgraph/assettokenization-uicomponents/Forms/Controllers";
import { History } from "../../components/History";
import { CancelButton } from "../../components/CancelButton";
import { SubmitHandler, useForm } from "react-hook-form";
import { AddSecurityFormValues } from "./AddSecurityFormValues";
import { useAddDigitalSecurity } from "../../hooks/queries/useAddDigitalSecurity";
import {
  GetRoleCountForRequest,
  GetSecurityDetailsRequest,
} from "@hashgraph/assettokenization-sdk";
import { isHederaValidAddress, required } from "../../utils/rules";
import { Button } from "@hashgraph/assettokenization-uicomponents/Interaction";
import { RouterManager } from "../../router/RouterManager";
import { useEffect, useState } from "react";
import { useWalletStore } from "../../store/walletStore";
import { useGetSecurityRoleCountFor } from "../../hooks/queries/useGetSecurityDetails";
import { useAccountStore } from "../../store/accountStore";
import { useToast } from "@hashgraph/assettokenization-uicomponents/Overlay/Toast";

export const AddSecurity = () => {
  const {
    mutate: addSecurity,
    isLoading: isAddSecurityLoading,
    data: addSecurityResult,
  } = useAddDigitalSecurity();
  const { control, formState, handleSubmit } = useForm<AddSecurityFormValues>({
    mode: "all",
  });
  const { t } = useTranslation("security", { keyPrefix: "add" });
  const { t: tRoutes } = useTranslation("routes");
  const { address } = useWalletStore();
  const { addSecurityToAdmin, adminSecurities } = useAccountStore();
  const [isRoleCountForLoading, setIsRoleCountForLoading] =
    useState<boolean>(false);
  const toast = useToast();

  const roleCountForRequest = new GetRoleCountForRequest({
    securityId: addSecurityResult?.diamondAddress ?? "",
    targetId: address,
  });

  const { data: roleCountFor, refetch: getSecurityRoleCountFor } =
    useGetSecurityRoleCountFor(roleCountForRequest, {
      enabled: false,
      onSettled: () => setIsRoleCountForLoading(false),
    });

  const submit: SubmitHandler<AddSecurityFormValues> = (params) => {
    const request = new GetSecurityDetailsRequest({
      ...params,
    });

    addSecurity(request);
  };

  useEffect(() => {
    if (addSecurityResult) {
      setIsRoleCountForLoading(true);
      getSecurityRoleCountFor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addSecurityResult]);

  useEffect(() => {
    if (typeof roleCountFor !== "undefined") {
      if (roleCountFor > 0) {
        const securities = adminSecurities[address];
        const existsInAdmin = securities?.some(
          (security) => security.address === addSecurityResult?.diamondAddress,
        );

        if (!existsInAdmin) {
          addSecurityToAdmin(address, {
            address: addSecurityResult?.diamondAddress!,
            isFavorite: false,
          });

          toast.show({
            duration: 3000,
            title: `${t("messages.addedToAdmin")}`,
            status: "success",
          });
        }

        RouterManager.to(RouteName.Dashboard);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleCountFor]);

  return (
    <Stack h="full" as="form" onSubmit={handleSubmit(submit)}>
      <History label={tRoutes(RouteName.AddSecurity)} />
      <HStack
        w="full"
        h="full"
        p="48px"
        background="neutral.50"
        justifyContent="center"
        alignItems="flex-start"
      >
        <VStack alignItems="flex-start">
          <Heading textStyle="HeadingMediumLG">{t("title")}</Heading>
          <Text textStyle="BodyRegularMD">{t("subtitle")}</Text>
          <Text textStyle="ElementsRegularSM" mt={6}>
            {t("form.mandatoryFields")}
          </Text>
          <Text textStyle="BodyTextRegularSM" mt={4}>
            {t("form.input.address.label")}
          </Text>
          <VStack w="450px" alignItems="flex-start">
            <InputController
              id="securityId"
              control={control}
              placeholder={t("form.input.address.placeholder")}
              backgroundColor="neutral.white"
              size="md"
              rules={{
                required,
                validate: { isHederaValidAddress },
              }}
            />
          </VStack>
          <HStack gap={4} mt="128px" justify="flex-end" alignSelf="flex-end">
            <CancelButton />
            <Button
              data-testid="add-security-button"
              size="md"
              variant="primary"
              isDisabled={!formState.isValid}
              type="submit"
              minW="unset"
              isLoading={isAddSecurityLoading || isRoleCountForLoading}
            >
              {t("addDigitalSecurity")}
            </Button>
          </HStack>
        </VStack>
      </HStack>
    </Stack>
  );
};
