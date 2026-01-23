// SPDX-License-Identifier: Apache-2.0

import { DefinitionList, DefinitionListProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { useSecurityStore } from "../../../store/securityStore";
import { useParams } from "react-router-dom";
import { toNumber } from "../../../utils/format";
import { useGetCompliance } from "../../../hooks/queries/useCompliance";
import { ComplianceRequest, IdentityRegistryRequest } from "@hashgraph/asset-tokenization-sdk";
import { useGetIdentityRegistry } from "../../../hooks/queries/useIdentityRegistry";

interface SecurityDetailsProps extends Omit<DefinitionListProps, "items"> {}

export const SecurityDetails = (props: SecurityDetailsProps) => {
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

  return (
    <DefinitionList
      data-testid="security-details"
      isLoading={details === null}
      items={[
        /*  {
          title: tProperties("type"),
          description: details?.securityType ?? "",
        },*/
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
          title: tProperties("id"),
          description: id ?? "",
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
        ...(compliance
          ? [
              {
                title: tProperties("compliance"),
                description: compliance ?? "",
              },
            ]
          : []),
        ...(identityRegistry
          ? [
              {
                title: tProperties("identityRegistry"),
                description: identityRegistry ?? "",
              },
            ]
          : []),
      ]}
      title="Details"
      {...props}
    />
  );
};
