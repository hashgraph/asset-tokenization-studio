import {
  DefinitionList,
  DefinitionListProps,
} from "@hashgraph/assettokenization-uicomponents/DataDisplay";
import { useTranslation } from "react-i18next";
import { formatNumberLocale, toNumber } from "../../../utils/format";
import { useSecurityStore } from "../../../store/securityStore";
import { useParams } from "react-router-dom";
import {
  ClipboardButton,
  Text,
} from "@hashgraph/assettokenization-uicomponents";
import { Flex } from "@chakra-ui/react";

interface SecurityDetailsExtended extends Omit<DefinitionListProps, "items"> {
  nominalValue?: number;
}

export const SecurityDetailsExtended = ({
  nominalValue,
  ...props
}: SecurityDetailsExtended) => {
  const { t: tProperties } = useTranslation("properties");
  const { details } = useSecurityStore();
  const { id } = useParams();

  return (
    <DefinitionList
      data-testid="security-details"
      isLoading={details === null}
      items={[
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
          description: formatNumberLocale(nominalValue, 2),
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
