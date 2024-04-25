import {
  HStack,
  SimpleGrid,
  Stack,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { PreviousStepButton } from "./PreviousStepButton";
import { PhosphorIcon } from "@hashgraph/securitytoken-uicomponents/Foundations";
import { useFormContext } from "react-hook-form";
import {
  Button,
  DetailReview,
  DetailReviewProps,
  InfoDivider,
  PopUp,
} from "@hashgraph/securitytoken-uicomponents";
import { useCreateBond } from "../../../hooks/queries/useCreateBond";
import { useWalletStore } from "../../../store/walletStore";
import { CreateBondRequest } from "@hashgraph/securitytoken-sdk";
import { ICreateBondFormValues } from "../ICreateBondFormValues";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { WarningCircle, Question } from "@phosphor-icons/react";
import { transformCouponType } from "../CouponType";
import {
  dateToUnixTimestamp,
  formatNumber,
  numberToExponential,
} from "../../../utils/format";
import { FormStepContainer } from "../../../components/FormStepContainer";
import { COUPONS_FACTOR, NOMINAL_VALUE_FACTOR } from "../../../utils/constants";
import { CountriesList } from "../../CreateSecurityCommons/CountriesList";
import {
  COUNTRY_LIST_ALLOWED,
  COUNTRY_LIST_BLOCKED,
} from "../../../utils/countriesConfig";

export const StepReview = () => {
  const { t } = useTranslation("security", { keyPrefix: "createBond" });
  const { t: tRegulation } = useTranslation("security", {
    keyPrefix: "regulation",
  });

  const { mutate: createBond, isLoading } = useCreateBond();
  const { address } = useWalletStore();

  const {
    isOpen: isOpenCancel,
    onClose: onCloseCancel,
    onOpen: onOpenCancel,
  } = useDisclosure();
  const {
    isOpen: isOpenCreate,
    onClose: onCloseCreate,
    onOpen: onOpenCreate,
  } = useDisclosure();

  const { getValues } = useFormContext<ICreateBondFormValues>();

  const name = getValues("name");
  const symbol = getValues("symbol");
  const decimals = getValues("decimals");
  const isin = getValues("isin");
  const currency = getValues("currency");
  const numberOfUnits = getValues("numberOfUnits");
  const nominalValue = getValues("nominalValue");
  const totalAmount = getValues("totalAmount");
  const startingDate = getValues("startingDate");
  const maturityDate = getValues("maturityDate");
  const couponType = getValues("couponType");
  let couponFrequency = getValues("couponFrequency");
  let couponRate = getValues("couponRate");
  let firstCouponDate = getValues("firstCouponDate");
  const lastCouponDate = getValues("lastCouponDate");
  const totalCoupons = getValues("totalCoupons");
  const isBlocklist = getValues("isBlocklist");
  const isControllable = getValues("isControllable");
  const regulationType = getValues("regulationType");
  const regulationSubType = getValues("regulationSubType");
  const countriesListType = getValues("countriesListType");
  let countriesList = getValues("countriesList");

  countriesList = countriesList.concat(
    countriesListType === 2 ? COUNTRY_LIST_ALLOWED : COUNTRY_LIST_BLOCKED,
  );

  const submit = () => {
    if (couponType === 2) {
      couponRate = 0;
      couponFrequency = "0";
      firstCouponDate = "0";
    }

    const request = new CreateBondRequest({
      name,
      symbol,
      isin,
      decimals,
      isWhiteList: !isBlocklist,
      isControllable,
      isMultiPartition: false,
      diamondOwnerAccount: address,
      numberOfUnits: numberToExponential(numberOfUnits, decimals),
      nominalValue: (nominalValue * NOMINAL_VALUE_FACTOR).toString(),
      startingDate: dateToUnixTimestamp(startingDate),
      maturityDate: dateToUnixTimestamp(maturityDate),
      couponFrequency: (
        parseInt(couponFrequency) *
        (30 * 24 * 60 * 60)
      ).toString(),
      couponRate: (couponRate * COUPONS_FACTOR).toString(),
      firstCouponDate:
        firstCouponDate != "0"
          ? dateToUnixTimestamp(firstCouponDate)
          : firstCouponDate,
      currency:
        "0x" +
        currency.charCodeAt(0) +
        currency.charCodeAt(1) +
        currency.charCodeAt(2),
      regulationType: regulationType,
      regulationSubType: regulationSubType,
      isCountryControlListWhiteList: countriesListType === 2,
      countries: countriesList.map((country) => country).toString(),
      info: "",
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
      value: formatNumber(nominalValue, {}, 2),
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

  const couponDetails: DetailReviewProps[] = [
    {
      title: t("stepCoupon.couponType"),
      value: transformCouponType(couponType),
    },
  ];
  if (couponType === 1) {
    couponDetails.push(
      {
        title: t("stepCoupon.couponRate"),
        value: formatNumber(couponRate) + " %",
      },
      {
        title: t("stepCoupon.couponFrequency"),
        value: "Every " + couponFrequency + " months",
      },
      {
        title: t("stepCoupon.firstCouponDate"),
        value: new Date(firstCouponDate).toLocaleDateString(),
      },
      {
        title: t("stepCoupon.lastCouponDate"),
        value: lastCouponDate,
      },
      {
        title: t("stepCoupon.totalCoupons"),
        value: totalCoupons,
      },
    );
  }

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
      title:
        countriesListType === 2
          ? tRegulation("allowedCountriesReview")
          : tRegulation("blockedCountriesReview"),
      value: countriesList
        .map(
          (country) =>
            " " + CountriesList[country as keyof typeof CountriesList],
        )
        .toString(),
    },
  ];

  return (
    <FormStepContainer>
      <Stack w="full">
        <VStack gap={5}>
          <InfoDivider
            step={1}
            title={"Token " + t("header.details")}
            type="main"
          />
          <SimpleGrid columns={1} gap={6} w="full">
            {tokenDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider
            step={2}
            title={t("header.configuration") + " details"}
            type="main"
          />
          <SimpleGrid columns={1} gap={6} w="full">
            {configurationDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider
            step={3}
            title={t("header.coupon") + " details"}
            type="main"
          />
          <SimpleGrid columns={1} gap={6} w="full">
            {couponDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <InfoDivider step={4} title={t("header.regulation")} type="main" />
          <SimpleGrid columns={1} gap={6} w="full">
            {regulationDetails.map((props) => (
              <DetailReview {...props} />
            ))}
          </SimpleGrid>

          <HStack
            gap={2}
            w="full"
            h="100px"
            align="end"
            justifyContent={"flex-end"}
          >
            <Button size="md" variant="secondary" onClick={onOpenCancel}>
              {t("cancelButton")}
            </Button>
            <PreviousStepButton />
            <Button
              size="md"
              variant="primary"
              onClick={onOpenCreate}
              isLoading={isLoading}
            >
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
