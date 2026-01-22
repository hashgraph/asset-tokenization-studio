// SPDX-License-Identifier: Apache-2.0

import { DefinitionList, DefinitionListProps, ClipboardButton, Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { formatDate, formatNumberLocale, toNumber } from "../../../utils/format";
import { useSecurityStore } from "../../../store/securityStore";
import { useParams } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import {
  BondDetailsViewModel,
  ComplianceRequest,
  EquityDetailsViewModel,
  IdentityRegistryRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useMemo } from "react";
import { MaturityDateItem } from "./MadurityDateItem";
import { DATE_TIME_FORMAT } from "../../../utils/constants";
import { useGetCompliance } from "../../../hooks/queries/useCompliance";
import { useGetIdentityRegistry } from "../../../hooks/queries/useIdentityRegistry";
import { ComplianceItem } from "./ComplianceItem";
import { IdentityRegistryItem } from "./IdentityRegistryItem";

interface SecurityDetailsExtendedProps extends Omit<DefinitionListProps, "items"> {
  bondDetailsResponse?: BondDetailsViewModel;
  equityDetailsResponse?: EquityDetailsViewModel;
  isLoadingSecurityDetails: boolean;
  isFetchingSecurityDetails: boolean;
}

export const SecurityDetailsExtended = ({
  bondDetailsResponse,
  equityDetailsResponse,
  isLoadingSecurityDetails,
  isFetchingSecurityDetails,
  ...props
}: SecurityDetailsExtendedProps) => {
  const { t: tProperties } = useTranslation("properties");
  const { details } = useSecurityStore();
  const { id } = useParams();

  const { data: compliance } = useGetCompliance(
    new ComplianceRequest({
      securityId: id!,
    }),
    {
      enabled: !!id,
    },
  );

  const { data: identityRegistry } = useGetIdentityRegistry(
    new IdentityRegistryRequest({
      securityId: id!,
    }),
    {
      enabled: !!id,
    },
  );

  const nominalValue = useMemo(() => {
    return toNumber(
      equityDetailsResponse?.nominalValue || bondDetailsResponse?.nominalValue,
      equityDetailsResponse?.nominalValueDecimals || bondDetailsResponse?.nominalValueDecimals || 0,
    );
  }, [equityDetailsResponse, bondDetailsResponse]);

  const nominalValueDecimals = useMemo(() => {
    return equityDetailsResponse?.nominalValueDecimals || bondDetailsResponse?.nominalValueDecimals || 0;
  }, [equityDetailsResponse, bondDetailsResponse]);

  const listItems = useMemo(() => {
    const items = [
      {
        title: tProperties("name"),
        description: details?.name ?? "",
      },
      {
        title: tProperties("symbol"),
        description: details?.symbol ?? "",
      },
      {
        title: tProperties("decimal"),
        description: details?.decimals ?? "",
      },
      {
        title: tProperties("isin"),
        description: details?.isin ?? "",
      },
      {
        title: tProperties("evmAddress"),
        description: details?.evmDiamondAddress ?? "",
        canCopy: true,
      },
      {
        title: tProperties("id"),
        description: (
          <Flex w="full" align="center">
            <Text textStyle="ElementsRegularSM">{id}</Text>
            <ClipboardButton value={id!} />
            <Text textStyle="ElementsSemiboldXS" ml={4}>
              {tProperties("copyId")}
            </Text>
          </Flex>
        ),
      },
      {
        title: tProperties("currency"),
        description: "USD",
      }, // TODO: - format from ASCII when more currencies are available
      {
        title: tProperties("nominalValue"),
        description: formatNumberLocale(nominalValue, nominalValueDecimals),
      },
      {
        title: tProperties("maxSupply"),
        description: `${details?.maxSupply} ${details?.symbol}`,
      },
      {
        title: tProperties("totalSupply"),
        description: `${details?.totalSupply} ${details?.symbol}`,
      },
      {
        title: tProperties("pendingToBeMinted"),
        description: `${toNumber(details?.maxSupply) - toNumber(details?.totalSupply)} ${details?.symbol}`,
      },
    ];

    if (compliance !== undefined && id) {
      items.push({
        title: tProperties("compliance"),
        description: <ComplianceItem securityId={id} />,
      });
    }

    if (identityRegistry !== undefined && id) {
      items.push({
        title: tProperties("identityRegistry"),
        description: <IdentityRegistryItem securityId={id} />,
      });
    }

    const isBond = details?.type === "BOND";

    if (isBond && bondDetailsResponse?.startingDate) {
      items.push({
        title: tProperties("startingDate"),
        description: formatDate(bondDetailsResponse.startingDate, DATE_TIME_FORMAT),
      });
    }

    if (isBond && bondDetailsResponse?.maturityDate && id) {
      items.push({
        title: tProperties("maturityDate"),
        description: <MaturityDateItem securityId={id} />,
      });
    }

    return items;
  }, [details, id, nominalValue, tProperties, bondDetailsResponse, compliance, identityRegistry]);

  return (
    <DefinitionList
      data-testid="security-details"
      isLoading={isLoadingSecurityDetails || isFetchingSecurityDetails}
      items={listItems}
      title="Details"
      {...props}
    />
  );
};
