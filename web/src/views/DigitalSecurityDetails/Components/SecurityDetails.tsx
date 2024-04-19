import {
  DefinitionList,
  DefinitionListProps,
} from "@iob/io-bricks-ui/DataDisplay";
import { useTranslation } from "react-i18next";
import { useSecurityStore } from "../../../store/securityStore";
import { useParams } from "react-router-dom";
import { toNumber } from "../../../utils/format";

interface SecurityDetails extends Omit<DefinitionListProps, "items"> {}

export const SecurityDetails = (props: SecurityDetails) => {
  const { t: tProperties } = useTranslation("properties");
  const { details } = useSecurityStore();
  const { id } = useParams();

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
          description: `${
            toNumber(details?.maxSupply) - toNumber(details?.totalSupply)
          } ${details?.symbol}`,
        },
      ]}
      title="Details"
      {...props}
    />
  );
};
