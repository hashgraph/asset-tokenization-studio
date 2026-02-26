// SPDX-License-Identifier: Apache-2.0

import { HStack, SimpleGrid, Stack, VStack, useDisclosure } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { PreviousStepButton } from "./PreviousStepButton";
import { PhosphorIcon, Table, Text } from "io-bricks-ui";
import { useFormContext } from "react-hook-form";
import { Button, DetailReview, DetailReviewProps, InfoDivider, PopUp } from "io-bricks-ui";
import { useCreateBond } from "../../../hooks/queries/useCreateBond";
import { useWalletStore } from "../../../store/walletStore";
import { CreateBondRequest } from "@hashgraph/asset-tokenization-sdk";
import { ICreateBondFormValues } from "../ICreateBondFormValues";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { WarningCircle, Question } from "@phosphor-icons/react";
import { dateToUnixTimestamp, formatNumber, numberToExponential, textToHex } from "../../../utils/format";
import { FormStepContainer } from "../../../components/FormStepContainer";
import { CountriesList } from "../../CreateSecurityCommons/CountriesList";
import { COUNTRY_LIST_ALLOWED, COUNTRY_LIST_BLOCKED } from "../../../utils/countriesConfig";
import { createColumnHelper } from "@tanstack/table-core";

interface IProceedRecipient {
  address: string;
  data?: string;
}

export const StepReview = () => {
  const { t } = useTranslation("security", { keyPrefix: "createBond" });
  const { t: tRegulation } = useTranslation("security", {
    keyPrefix: "regulation",
  });

  const { mutate: createBond, isLoading } = useCreateBond();
  const { address } = useWalletStore();

  const { isOpen: isOpenCancel, onClose: onCloseCancel, onOpen: onOpenCancel } = useDisclosure();
  const { isOpen: isOpenCreate, onClose: onCloseCreate, onOpen: onOpenCreate } = useDisclosure();

  const { getValues } = useFormContext<ICreateBondFormValues>();

  const name = getValues("name");
  const symbol = getValues("symbol");
  const decimals = getValues("decimals");
  const isin = getValues("isin");
  const currency = getValues("currency");
  const numberOfUnits = getValues("numberOfUnits");
  const nominalValue = getValues("nominalValue");
  const nominalValueParts = nominalValue.toString().split(".");
  const nominalValueDynamicDecimals = nominalValueParts.length > 1 ? nominalValueParts[1].length : 0;
  const nominalValueRawValue = nominalValueParts.join("");
  const totalAmount = getValues("totalAmount");
  const startingDate = getValues("startingDate");
  const maturityDate = getValues("maturityDate");
  const isBlocklist = getValues("isBlocklist");
  const isControllable = getValues("isControllable");
  const isClearing = getValues("isClearing");
  const regulationType = getValues("regulationType");
  const regulationSubType = getValues("regulationSubType");
  const countriesListType = getValues("countriesListType");
  let countriesList = getValues("countriesList");
  const externalPausesList = getValues("externalPausesList");
  const externalControlList = getValues("externalControlList");
  const externalKYCList = getValues("externalKYCList");
  const internalKycActivated = getValues("internalKycActivated");
  const complianceId = getValues("complianceId");
  const identityRegistryId = getValues("identityRegistryId");
  const proceedRecipientsIds = getValues("proceedRecipientsIds");
  const proceedRecipientsData = getValues("proceedRecipientsData");

  countriesList = countriesList.concat(countriesListType === 2 ? COUNTRY_LIST_ALLOWED : COUNTRY_LIST_BLOCKED);

  const proceedRecipientsTableData: IProceedRecipient[] = (proceedRecipientsIds || []).map((address, index) => ({
    address,
    data: (proceedRecipientsData || [])[index] || "",
  }));

  const columnsHelper = createColumnHelper<IProceedRecipient>();
  const columnsProceedRecipients = [
    columnsHelper.accessor("address", {
      header: t("stepProceedRecipients.address"),
      enableSorting: false,
    }),
    columnsHelper.accessor("data", {
      header: t("stepProceedRecipients.data"),
      enableSorting: false,
    }),
  ];

  const submit = () => {
    const request = new CreateBondRequest({
      name,
      symbol,
      isin,
      decimals,
      isWhiteList: !isBlocklist,
      erc20VotesActivated: false,
      isControllable,
      clearingActive: isClearing,
      arePartitionsProtected: false,
      isMultiPartition: false,
      diamondOwnerAccount: address,
      numberOfUnits: numberToExponential(numberOfUnits, decimals),
      nominalValue: nominalValueRawValue,
      nominalValueDecimals: nominalValueDynamicDecimals,
      startingDate: dateToUnixTimestamp(startingDate),
      maturityDate: dateToUnixTimestamp(maturityDate),
      currency: "0x" + currency.charCodeAt(0) + currency.charCodeAt(1) + currency.charCodeAt(2),
      regulationType: regulationType,
      regulationSubType: regulationSubType,
      isCountryControlListWhiteList: countriesListType === 2,
      countries: countriesList.map((country) => country).toString(),
      info: "",
      configId: process.env.REACT_APP_BOND_CONFIG_ID ?? "",
      configVersion: parseInt(process.env.REACT_APP_BOND_CONFIG_VERSION ?? "0"),
      ...(externalPausesList &&
        externalPausesList.length > 0 && {
          externalPausesIds: externalPausesList,
        }),
      ...(externalControlList &&
        externalControlList.length > 0 && {
          externalControlListsIds: externalControlList,
        }),
      ...(externalKYCList &&
        externalKYCList.length > 0 && {
          externalKycListsIds: externalKYCList,
        }),
      internalKycActivated,
      ...(complianceId && {
        complianceId: complianceId,
      }),
      ...(identityRegistryId && {
        identityRegistryId: identityRegistryId,
      }),
      ...(proceedRecipientsIds &&
        proceedRecipientsIds.length > 0 && {
          proceedRecipientsIds: proceedRecipientsIds,
        }),
      ...(proceedRecipientsData &&
        proceedRecipientsData.length > 0 && {
          proceedRecipientsData: proceedRecipientsData.map((data) => textToHex(data)),
        }),
    });

    createBond(request);
  };

  const tokenDetails: DetailReviewProps[] = [
    {
      title: t("stepTokenDetails.name"),
      value: name,
    },
    {
      title: t("stepTokenDetails.symbol"),
      value: symbol,
    },
    {
      title: t("stepTokenDetails.decimals"),
      value: decimals,
    },
    {
      title: t("stepTokenDetails.isin"),
      value: isin,
    },
  ];

  const configurationDetails: DetailReviewProps[] = [
    {
      title: t("stepConfiguration.currency"),
      value: currency,
    },
    {
      title: t("stepConfiguration.numberOfUnits"),
      value: formatNumber(numberOfUnits, {}, decimals),
    },
    {
      title: t("stepConfiguration.nominalValue"),
      value: formatNumber(nominalValue, {}, nominalValueDynamicDecimals),
    },
    {
      title: t("stepConfiguration.totalAmount"),
      value: totalAmount,
    },
    {
      title: t("stepConfiguration.startingDate"),
      value: new Date(startingDate).toLocaleDateString(),
    },
    {
      title: t("stepConfiguration.maturityDate"),
      value: new Date(maturityDate).toLocaleDateString(),
    },
  ];

  const erc3643Details: DetailReviewProps[] = [
    {
      title: t("stepERC3643.complianceId"),
      value: complianceId ?? "-",
    },
    {
      title: t("stepERC3643.identityRegistryId"),
      value: identityRegistryId ?? "-",
    },
  ];
  const externalManagement: DetailReviewProps[] = [
    {
      title: t("stepExternalManagement.externalPause"),
      value: externalPausesList ? externalPausesList?.map((pause) => " " + pause).toString() : "-",
    },
    {
      title: t("stepExternalManagement.externalControl"),
      value: externalControlList ? externalControlList?.map((control) => " " + control).toString() : "-",
    },
    {
      title: t("stepExternalManagement.externalKYC"),
      value: externalKYCList ? externalKYCList?.map((control) => " " + control).toString() : "-",
    },
  ];

  const regulationDetails: DetailReviewProps[] = [
    {
      title: tRegulation("regulationTypeReview"),
      value: tRegulation(`regulationType_${regulationType}`),
    },
    {
      title: tRegulation("regulationSubTypeReview"),
      value: tRegulation(`regulationSubType_${regulationSubType}`),
    },
    {
      title: countriesListType === 2 ? tRegulation("allowedCountriesReview") : tRegulation("blockedCountriesReview"),
      value: countriesList.map((country) => " " + CountriesList[country as keyof typeof CountriesList]).toString(),
    },
  ];

  return (
    <FormStepContainer>
      <Stack w="full">
        <VStack gap={5}>
          <InfoDivider step={1} title={"Token " + t("header.details")} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {tokenDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider step={2} title={t("header.configuration") + " details"} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {configurationDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider step={3} title={t("stepProceedRecipients.title")} type="main" />
          <Stack w="full">
            {proceedRecipientsTableData.length > 0 && (
              <Table name="proceedRecipients" columns={columnsProceedRecipients} data={proceedRecipientsTableData} />
            )}
            {!proceedRecipientsTableData.length && <Text>-</Text>}
          </Stack>

          <InfoDivider step={4} title={t("stepERC3643.title")} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {erc3643Details.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider step={5} title={t("stepExternalManagement.title")} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {externalManagement.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider step={6} title={t("header.regulation")} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {regulationDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <HStack gap={2} w="full" h="100px" align="end" justifyContent={"flex-end"}>
            <Button size="md" variant="secondary" onClick={onOpenCancel}>
              {t("cancelButton")}
            </Button>
            <PreviousStepButton />
            <Button size="md" variant="primary" onClick={onOpenCreate} isLoading={isLoading}>
              {t("createTokenButton")}
            </Button>
          </HStack>
        </VStack>
      </Stack>
      <PopUp
        id="cancelBondCreation"
        isOpen={isOpenCancel}
        onClose={onCloseCancel}
        icon={<PhosphorIcon as={WarningCircle} size="md" />}
        title={t("cancelSecurityPopUp.title")}
        description={t("cancelSecurityPopUp.description")}
        confirmText={t("cancelSecurityPopUp.confirmText")}
        onConfirm={() => {
          RouterManager.to(RouteName.Dashboard);
          onCloseCancel();
        }}
        onCancel={onCloseCancel}
        cancelText={t("cancelSecurityPopUp.cancelText")}
        confirmButtonProps={{ status: "danger" }}
      />
      <PopUp
        id="createBond"
        isOpen={isOpenCreate}
        onClose={onCloseCreate}
        icon={<PhosphorIcon as={Question} size="md" />}
        title={t("createSecurityPopUp.title")}
        description={t("createSecurityPopUp.description")}
        confirmText={t("createSecurityPopUp.confirmText")}
        onConfirm={() => {
          submit();
          onCloseCreate();
        }}
        onCancel={onCloseCreate}
        cancelText={t("createSecurityPopUp.cancelText")}
      />
    </FormStepContainer>
  );
};
