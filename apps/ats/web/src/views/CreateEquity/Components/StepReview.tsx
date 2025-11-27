// SPDX-License-Identifier: Apache-2.0

import { HStack, SimpleGrid, Stack, VStack, useDisclosure } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { PreviousStepButton } from "./PreviousStepButton";
import { PhosphorIcon, Text, Button, DetailReview, DetailReviewProps, InfoDivider, PopUp } from "io-bricks-ui";
import { useFormContext } from "react-hook-form";
import { ICreateEquityFormValues } from "../ICreateEquityFormValues";
import { useCreateEquity } from "../../../hooks/queries/useCreateEquity";
import { useWalletStore } from "../../../store/walletStore";
import { CreateEquityRequest } from "@hashgraph/asset-tokenization-sdk";
import { transformDividendType } from "../DividendType";
import { WarningCircle, Question } from "@phosphor-icons/react";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { numberToExponential } from "../../../utils/format";
import { FormStepContainer } from "../../../components/FormStepContainer";
import { formatNumber } from "../../../utils/format";
import { CountriesList } from "../../CreateSecurityCommons/CountriesList";
import { COUNTRY_LIST_ALLOWED, COUNTRY_LIST_BLOCKED } from "../../../utils/countriesConfig";

export const StepReview = () => {
  const { t } = useTranslation("security", { keyPrefix: "createEquity" });
  const { t: tRegulation } = useTranslation("security", {
    keyPrefix: "regulation",
  });

  const { getValues } = useFormContext<ICreateEquityFormValues>();
  const { mutate: createSecurity, isLoading } = useCreateEquity();
  const { address } = useWalletStore();

  const { isOpen: isOpenCancel, onClose: onCloseCancel, onOpen: onOpenCancel } = useDisclosure();
  const { isOpen: isOpenCreate, onClose: onCloseCreate, onOpen: onOpenCreate } = useDisclosure();

  const name = getValues("name");
  const symbol = getValues("symbol");
  const isin = getValues("isin");
  const decimals = getValues("decimals");
  const isControllable = getValues("isControllable");
  const isBlocklist = getValues("isBlocklist");
  const isClearing = getValues("isClearing");
  const nominalValue = getValues("nominalValue");
  const nominalValueParts = nominalValue.toString().split(".");
  const nominalValueDynamicDecimals = nominalValueParts.length > 1 ? nominalValueParts[1].length : 0;
  const nominalValueRawValue = nominalValueParts.join("");
  const currency = getValues("currency");
  const numberOfShares = getValues("numberOfShares");
  const totalAmount = getValues("totalAmount");
  const rights = {
    votingRights: getValues("isVotingRight"),
    informationRights: getValues("isInformationRight"),
    liquidationRights: getValues("isLiquidationRight"),
    subscriptionRights: getValues("isSubscriptionRight"),
    conversionRights: getValues("isConversionRight"),
    redemptionRights: getValues("isRedemptionRight"),
    putRights: getValues("isPutRight"),
  };
  const dividendType = getValues("dividendType");
  const regulationType = getValues("regulationType");
  const regulationSubType = getValues("regulationSubType");
  const countriesListType = getValues("countriesListType");
  let countriesList: string[] = getValues("countriesList");
  const externalPausesList = getValues("externalPausesList");
  const externalControlList = getValues("externalControlList");
  const externalKYCList = getValues("externalKYCList");
  const internalKycActivated = getValues("internalKycActivated");
  const complianceId = getValues("complianceId");
  const identityRegistryId = getValues("identityRegistryId");

  countriesList = countriesList.concat(countriesListType === 2 ? COUNTRY_LIST_ALLOWED : COUNTRY_LIST_BLOCKED);

  const submit = () => {
    const request = new CreateEquityRequest({
      name: name,
      symbol: symbol,
      isin: isin,
      decimals: decimals,
      isWhiteList: !isBlocklist,
      erc20VotesActivated: false,
      isControllable: isControllable,
      clearingActive: isClearing,
      arePartitionsProtected: false,
      isMultiPartition: false,
      diamondOwnerAccount: address,
      votingRight: rights.votingRights,
      informationRight: rights.informationRights,
      liquidationRight: rights.liquidationRights,
      subscriptionRight: rights.subscriptionRights,
      conversionRight: rights.conversionRights,
      redemptionRight: rights.redemptionRights,
      putRight: rights.putRights,
      dividendRight: dividendType,
      currency: "0x" + currency.charCodeAt(0) + currency.charCodeAt(1) + currency.charCodeAt(2),
      numberOfShares: numberToExponential(numberOfShares, decimals),
      nominalValue: nominalValueRawValue,
      nominalValueDecimals: nominalValueDynamicDecimals,
      regulationType: regulationType,
      regulationSubType: regulationSubType,
      isCountryControlListWhiteList: countriesListType === 2,
      countries: countriesList.map((country) => country).toString(),
      info: "",
      configId: process.env.REACT_APP_EQUITY_CONFIG_ID ?? "",
      configVersion: parseInt(process.env.REACT_APP_EQUITY_CONFIG_VERSION ?? "0"),
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
    });

    createSecurity(request);
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

  const configurationNewSerieDetails: DetailReviewProps[] = [
    {
      title: t("stepNewSerie.nominalValue"),
      value: formatNumber(nominalValue, {}, nominalValueDynamicDecimals),
    },
    {
      title: t("stepNewSerie.currency"),
      value: currency,
    },
    {
      title: t("stepNewSerie.numberOfShares"),
      value: formatNumber(numberOfShares, {}, decimals),
    },
    {
      title: t("stepNewSerie.totalAmount"),
      value: totalAmount,
    },
  ];

  const configurationRightsDetails: DetailReviewProps[] = [
    {
      title: t("stepNewSerie.dividendType"),
      value: transformDividendType(dividendType.toString()),
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
          <InfoDivider step={1} title={t("stepTokenDetails.title")} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {tokenDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider step={2} title={t("stepReview.configurationDetails")} type="main" />
          <InfoDivider title="Economic information" type="secondary" />
          <SimpleGrid columns={1} gap={6} w="full">
            {configurationNewSerieDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider title="Rights and privileges" type="secondary" />
          <VStack gap={1} w="full">
            <Text textStyle="HeadingMediumMD" w="full" color="neutral.900">
              {t("stepNewSerie.choosenRights")}
            </Text>
            {Object.entries(rights)
              .filter(([_key, value]) => value)
              .map(([key]) => (
                <Text textStyle="BodyTextRegularSM" w="full" color="neutral.700" key={key}>
                  · {t(`stepNewSerie.${key}`)}
                </Text>
              ))}
          </VStack>

          <SimpleGrid columns={1} gap={6} w="full">
            {configurationRightsDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider step={3} title={t("stepERC3643.title")} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {erc3643Details.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider step={4} title={t("stepExternalManagement.title")} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {externalManagement.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider step={5} title={tRegulation("title")} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {regulationDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <HStack gap={4} w="full" h="100px" align="end" justifyContent={"flex-end"}>
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
        id="cancelEquityCreation"
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
        id="createEquity"
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
