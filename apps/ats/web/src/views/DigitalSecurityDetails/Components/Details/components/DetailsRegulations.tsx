import { DefinitionList } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { SecurityViewModel } from "@hashgraph/asset-tokenization-sdk";
import { CountriesList } from "../../../../CreateSecurityCommons/CountriesList";
import _capitalize from "lodash/capitalize";

interface DetailsRegulationsProps {
  isLoadingSecurityDetails: boolean;
  isFetchingSecurityDetails: boolean;
  securityDetails: SecurityViewModel;
}

export const DetailsRegulations = ({
  isLoadingSecurityDetails,
  isFetchingSecurityDetails,
  securityDetails,
}: DetailsRegulationsProps) => {
  const { t: tRegulations } = useTranslation("properties", {
    keyPrefix: "regulations",
  });
  const { t: tRegulation } = useTranslation("security", {
    keyPrefix: "regulation",
  });

  const regulationItems = [
    {
      title: tRegulations("regulationType"),
      description: tRegulation(`regulationType_${securityDetails?.regulation?.type}`),
    },
    {
      title: tRegulations("regulationSubType"),
      description: securityDetails?.regulation?.subType.replace("_", " ") ?? "-",
    },
    {
      title: securityDetails?.isCountryControlListWhiteList
        ? tRegulations("allowedCountries")
        : tRegulations("blockedCountries"),
      description:
        securityDetails?.countries
          ?.split(",")
          .map((country) => CountriesList[country as keyof typeof CountriesList])
          .join(" - ") ?? "",
    },
    {
      title: tRegulations("dealSize"),
      description:
        securityDetails?.regulation?.dealSize !== "0"
          ? `${securityDetails?.regulation?.dealSize} $`
          : tRegulations("dealSizePlaceHolder"),
    },
    {
      title: tRegulations("accreditedInvestors"),
      description: _capitalize(securityDetails?.regulation?.accreditedInvestors),
    },
    {
      title: tRegulations("maxNonAccreditedInvestors"),
      description:
        securityDetails?.regulation?.maxNonAccreditedInvestors !== 0
          ? `${securityDetails?.regulation?.maxNonAccreditedInvestors}`
          : tRegulations("maxNonAccreditedInvestorsPlaceHolder"),
    },
    {
      title: tRegulations("manualInvestorVerification"),
      description: _capitalize(securityDetails?.regulation?.manualInvestorVerification),
    },
    {
      title: tRegulations("internationalInvestors"),
      description: _capitalize(securityDetails?.regulation?.internationalInvestors),
    },
    {
      title: tRegulations("resaleHoldPeriod"),
      description: _capitalize(securityDetails?.regulation?.resaleHoldPeriod),
    },
  ];

  return (
    <DefinitionList
      isLoading={isLoadingSecurityDetails || isFetchingSecurityDetails}
      items={regulationItems}
      title={tRegulations("label")}
      layerStyle="container"
    />
  );
};
