import { useEffect, useState } from "react";
import { Button, HStack, Stack, VStack, useDisclosure } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { PhosphorIcon, Text, Weight } from "@hashgraph/securitytoken-uicomponents/Foundations";
import { Plus, X } from "@phosphor-icons/react";
import { CancelButton } from "../../components/CancelButton";
import { PreviousStepButton } from "../CreateEquity/Components/PreviousStepButton";
import {
  InfoDivider,
  PanelTitle,
  Select,
  SelectController,
  SelectOption,
  Table,
  Tag,
  useStepContext,
} from "@hashgraph/securitytoken-uicomponents";
import { required } from "../../utils/rules";
import { ICreateEquityFormValues } from "../CreateEquity/ICreateEquityFormValues";
import { useFormContext, useFormState } from "react-hook-form";
import { PopUp, Tooltip } from "@hashgraph/securitytoken-uicomponents/Overlay";
import { Info } from "@phosphor-icons/react";
import { FormStepContainer } from "../../components/FormStepContainer";
import { CountriesList } from "./CountriesList";
import { useGetRegulationDetails } from "../../hooks/queries/useGetSecurityDetails";
import { GetRegulationDetailsRequest } from "@hashgraph/securitytoken-sdk";
import { createColumnHelper } from "@tanstack/react-table";
import {
  COUNTRY_LIST_ALLOWED,
  COUNTRY_LIST_BLOCKED,
} from "../../utils/countriesConfig";
import { ICreateBondFormValues } from "../CreateBond/ICreateBondFormValues";
import _capitalize from "lodash/capitalize";

interface Regulation {
  restriction: {
    text: string;
    tooltip: string;
  };
  rule: string | number;
}

export const StepRegulation = () => {
  const { t } = useTranslation("security", { keyPrefix: "regulation" });
  const { control, watch, setValue } = useFormContext<
    ICreateEquityFormValues | ICreateBondFormValues
  >();
  const stepFormState = useFormState({ control });
  const [countryToAdd, setCountryToAdd] = useState<string>("");
  const { goToNext } = useStepContext();

  const regulationType = watch("regulationType");
  const regulationSubType = watch("regulationSubType");
  const countriesListType = watch("countriesListType");
  let countriesList: string[] = watch("countriesList");

  useEffect(() => {
    if (regulationType === 1) {
      setValue("regulationSubType", 0);
      setValue("countriesListType", 1);
    } else {
      setValue("regulationSubType", 1);
      setValue("countriesListType", 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regulationType]);

  // GET Regulation Details
  const { data: regulationDetails, refetch: refetchRegulations } =
    useGetRegulationDetails(
      new GetRegulationDetailsRequest({
        regulationType: regulationType,
        regulationSubType: regulationSubType,
      }),
      {
        retry: false,
      },
    );

  useEffect(() => {
    refetchRegulations();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regulationType, regulationSubType]);

  const addCountryOnSubmit = () => {
    if (countryToAdd !== "") {
      if (!countriesList.includes(countryToAdd)) {
        countriesList.push(countryToAdd);
      }
      setCountryToAdd("");
    }
  };

  const onOptionChangeHandler = (country: SelectOption) => {
    setCountryToAdd(country.value);
  };

  const onRemoveCountryHandler = (country: string) => {
    setValue(
      "countriesList",
      countriesList.filter((obj) => obj !== country),
    );
  };

  const { isOpen, onClose, onOpen } = useDisclosure();

  const columnHelper = createColumnHelper<Regulation>();
  const columns = [
    columnHelper.accessor("restriction", {
      header: t("restrictions"),
      size: 160,
      enableSorting: false,
      cell: ({ getValue }) => {
        const { text, tooltip } = getValue();

        return (
          <HStack justifySelf="flex-start">
            <Text textStyle="BodyTextRegularSM">{text}</Text>
            <Tooltip label={tooltip} placement="right">
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
        );
      },
    }),
    columnHelper.accessor("rule", {
      header: t("rules"),
      size: 160,
      enableSorting: false,
      cell: ({ getValue }) => {
        return (
          <Text textStyle="BodyTextRegularSM" noOfLines={2}>
            {getValue()}
          </Text>
        );
      },
    }),
  ];

  const dataRegulations: Regulation[] = [
    {
      restriction: {
        text: t("dealSize"),
        tooltip: t("dealSizeTooltip"),
      },
      rule:
        regulationDetails?.dealSize !== "0"
          ? `${regulationDetails?.dealSize} $` || ""
          : t("dealSizePlaceHolder"),
    },
    {
      restriction: {
        text: t("accreditedInvestors"),
        tooltip: t("accreditedInvestorsTooltip"),
      },
      rule: _capitalize(regulationDetails?.accreditedInvestors) ?? "",
    },
    {
      restriction: {
        text: t("maxNonAccreditedInvestors"),
        tooltip: t("maxNonAccreditedInvestorsTooltip"),
      },
      rule:
        regulationDetails?.maxNonAccreditedInvestors !== 0
          ? `${regulationDetails?.maxNonAccreditedInvestors}` || ""
          : t("maxNonAccreditedInvestorsPlaceHolder"),
    },
    {
      restriction: {
        text: t("manualInvestorVerification"),
        tooltip: t("manualInvestorVerificationTooltip"),
      },
      rule: _capitalize(regulationDetails?.manualInvestorVerification) ?? "",
    },
    {
      restriction: {
        text: t("internationalInvestors"),
        tooltip: t("internationalInvestorsTooltip"),
      },
      rule: _capitalize(regulationDetails?.internationalInvestors) ?? "",
    },
    {
      restriction: {
        text: t("resaleHoldPeriod"),
        tooltip: t("resaleHoldPeriodTooltip"),
      },
      rule: _capitalize(regulationDetails?.resaleHoldPeriod) ?? "",
    },
  ];

  return (
    <FormStepContainer>
      <Stack w="600px" gap={8}>
        <Stack>
          <Text textStyle="HeadingMediumLG">{t("title")}</Text>
          <HStack alignItems="top">
            <PhosphorIcon as={Info} fill="primary.500" weight={Weight.Fill} />
            <VStack alignItems="left">
              <Text textStyle="ElementsSemiboldSM">{t("important") + ":"}</Text>
              <Text textStyle="ElementsRegularSM">{t("titleImportant")}</Text>
            </VStack>
          </HStack>
        </Stack>
        <Stack w="full">
          <HStack justifySelf="flex-start">
            <Text textStyle="BodyTextRegularSM">{t("jurisdiction")}</Text>
            <Tooltip label={t("jurisdictionTooltip")} placement="right">
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <Select
            size="md"
            placeholder="United States jurisdiction"
            defaultValue={1}
            options={[
              {
                label: "United States jurisdiction",
                value: "1",
              },
            ]}
          />
        </Stack>
        <InfoDivider title={t("selectRegulation")} type="main" />
        <Stack w="full">
          <HStack justifySelf="flex-start">
            <Text textStyle="BodyTextRegularSM">{t("regulationType")}</Text>
            <Tooltip label={t("regulationTypeTooltip")} placement="right">
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <SelectController
            control={control}
            id="regulationType"
            rules={{ required }}
            size="md"
            options={[
              {
                value: 1,
                label: t("regulationType_1"),
              },
              {
                value: 2,
                label: t("regulationType_2"),
              },
            ]}
          />
        </Stack>
        {regulationType !== 1 && (
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">
                {t("regulationSubType")}
              </Text>
              <Tooltip label={t("regulationSubTypeTooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <SelectController
              control={control}
              id="regulationSubType"
              size="md"
              options={[
                {
                  value: 1,
                  label: t("regulationSubType_1"),
                },
                {
                  value: 2,
                  label: t("regulationSubType_2"),
                },
              ]}
            />
          </Stack>
        )}
        <HStack alignItems="top">
          <PhosphorIcon as={Info} fill="primary.500" weight={Weight.Fill} />
          <VStack alignItems="left">
            <Text textStyle="ElementsSemiboldSM">{t("important") + ":"}</Text>
            <Text textStyle="ElementsRegularSM">
              {t("selectRegulationImportant")}
            </Text>
          </VStack>
        </HStack>
        <PanelTitle
          title={
            (regulationType ? t(`regulationType_${regulationType}`) : "") +
            " " +
            (regulationType === 2
              ? t(`regulationSubType_${regulationSubType}`)
              : "")
          }
        />
        <Table name="regulations" columns={columns} data={dataRegulations} />
        <InfoDivider
          title={
            countriesListType === 1 ? t("blockedList") : t("authorizationList")
          }
          type="main"
        />
        <HStack alignItems="top">
          <PhosphorIcon as={Info} fill="primary.500" weight={Weight.Fill} />
          <VStack alignItems="left">
            <Text textStyle="ElementsSemiboldSM">{t("important") + ":"}</Text>
            <Text textStyle="ElementsRegularSM">
              {countriesListType === 1
                ? t("blockedListImportant")
                : t("authorizationListImportant")}
            </Text>
          </VStack>
        </HStack>
        <Stack w="full">
          <HStack justifySelf="flex-start">
            <Text textStyle="BodyTextRegularSM">{t("selectCountry")}</Text>
            <Tooltip
              label={
                t("selectCountryTooltip") +
                " " +
                (countriesListType === 1 ? t("blockList") : t("allowList"))
              }
              placement="right"
            >
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <HStack w="full" gap={6} as="form" alignItems="flex-start">
            <Select
              id="country"
              size="md"
              options={Object.entries(CountriesList).map(([key, value]) => ({
                label: value,
                value: key,
              }))}
              onChange={(country) =>
                onOptionChangeHandler(country as SelectOption)
              }
            />
            <Button
              size="sm"
              leftIcon={<PhosphorIcon as={Plus} />}
              onClick={addCountryOnSubmit}
            >
              {t("addCountryButton") +
                " " +
                (countriesListType === 1 ? t("blockList") : t("allowList"))}
            </Button>
          </HStack>
        </Stack>

        {countriesList && (
          <>
            <VStack w="auto" layerStyle="whiteContainer">
              <PanelTitle
                title={
                  t("countriesIn") +
                  " " +
                  (countriesListType === 1 ? t("blockList") : t("allowList"))
                }
              />
              <HStack
                layerStyle="whiteContainer"
                noOfLines={20}
                lineHeight={10}
              >
                {countriesListType === 1
                  ? COUNTRY_LIST_BLOCKED.map((country) => (
                      <Tag
                        label={
                          CountriesList[country as keyof typeof CountriesList]
                        }
                        size="sm"
                        disabled
                      />
                    ))
                  : COUNTRY_LIST_ALLOWED.map((country) => (
                      <Tag
                        label={
                          CountriesList[country as keyof typeof CountriesList]
                        }
                        size="sm"
                        disabled
                      />
                    ))}
                {countriesList.map((country) => (
                  <Tag
                    label={CountriesList[country as keyof typeof CountriesList]}
                    rightIcon={<PhosphorIcon as={X} />}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onRemoveCountryHandler(country);
                    }}
                  />
                ))}
              </HStack>
            </VStack>
          </>
        )}

        <HStack
          gap={4}
          w="full"
          h="100px"
          align="end"
          justifyContent={"flex-end"}
        >
          <CancelButton />
          <PreviousStepButton />

          <Button
            size="md"
            variant="primary"
            onClick={onOpen}
            isDisabled={!stepFormState.isValid}
          >
            {t("nextStepButton")}
          </Button>
        </HStack>
      </Stack>

      <PopUp
        id="acceptRegulation"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={Info} size="md" />}
        title={t("titlePopUp")}
        description={t("descriptionPopUp")}
        cancelText={t("cancelTextPopUp")}
        confirmText={t("confirmTextPopUp")}
        onConfirm={() => {
          goToNext?.();
          onClose();
        }}
        onCancel={onClose}
      />
    </FormStepContainer>
  );
};
