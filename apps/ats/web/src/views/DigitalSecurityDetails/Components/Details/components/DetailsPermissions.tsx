import { DefinitionList } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { EquityDetailsViewModel, SecurityViewModel } from "@hashgraph/asset-tokenization-sdk";
import { useMemo } from "react";

interface DetailsPermissionsProps {
  isLoadingSecurityDetails: boolean;
  isFetchingSecurityDetails: boolean;
  securityDetails: SecurityViewModel;
  equityDetailsResponse?: EquityDetailsViewModel;
}

export const DetailsPermissions = ({
  isLoadingSecurityDetails,
  isFetchingSecurityDetails,
  securityDetails,
  equityDetailsResponse,
}: DetailsPermissionsProps) => {
  const { t: tPermissions } = useTranslation("properties", {
    keyPrefix: "permissions",
  });
  const { t: tRights } = useTranslation("security", {
    keyPrefix: "createEquity",
  });

  const rightsAndPrivileges = {
    votingRights: equityDetailsResponse?.votingRight,
    informationRights: equityDetailsResponse?.informationRight,
    liquidationRights: equityDetailsResponse?.liquidationRight,
    subscriptionRights: equityDetailsResponse?.subscriptionRight,
    conversionRights: equityDetailsResponse?.conversionRight,
    redemptionRights: equityDetailsResponse?.redemptionRight,
    putRights: equityDetailsResponse?.putRight,
  };

  const rightsAndPrivilegesFiltered = Object.entries(rightsAndPrivileges)
    .filter(([_key, value]) => value)
    .map(([key]) => tRights(`stepNewSerie.${key}`));

  const permissionsItems = useMemo(() => {
    const items = [
      {
        title: tPermissions("controllable"),
        description: securityDetails?.isControllable ? tPermissions("allowed") : tPermissions("notAllowed"),
      },
      {
        title: tPermissions("blocklist"),
        description: securityDetails?.isWhiteList ? tPermissions("notAllowed") : tPermissions("allowed"),
      },
      {
        title: tPermissions("approvalList"),
        description: securityDetails?.isWhiteList ? tPermissions("allowed") : tPermissions("notAllowed"),
      },
    ];

    // Add rights and privileges if they exist
    if (rightsAndPrivilegesFiltered.length > 0) {
      items.push({
        title: tPermissions("rightsAndPrivileges"),
        description: rightsAndPrivilegesFiltered.join(", "),
      });
    }

    return items;
  }, [securityDetails, tPermissions, rightsAndPrivilegesFiltered]);

  return (
    <DefinitionList
      isLoading={isLoadingSecurityDetails || isFetchingSecurityDetails}
      items={permissionsItems}
      title={tPermissions("label")}
      layerStyle="container"
    />
  );
};
