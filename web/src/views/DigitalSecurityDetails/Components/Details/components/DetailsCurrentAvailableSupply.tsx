import { Center, Box, Text, SkeletonText } from "@chakra-ui/react";
import { Panel } from "../../../../../components/Panel";
import { useTranslation } from "react-i18next";
import { formatNumberLocale, toNumber } from "../../../../../utils/format";
import {
  GetAccountBalanceRequest,
  SecurityViewModel,
} from "@hashgraph/asset-tokenization-sdk";
import { EquityDetailsViewModel } from "@hashgraph/asset-tokenization-sdk";
import { BondDetailsViewModel } from "@hashgraph/asset-tokenization-sdk";
import { useUserStore } from "../../../../../store/userStore";
import { User } from "../../../../../utils/constants";
import { useWalletStore } from "../../../../../store/walletStore";
import { useGetBalanceOf } from "../../../../../hooks/queries/useGetSecurityDetails";

interface DetailsCurrentAvailableSupplyProps {
  id: string;
  detailsResponse: SecurityViewModel;
  equityDetailsResponse?: EquityDetailsViewModel;
  bondDetailsResponse?: BondDetailsViewModel;
}

export const DetailsCurrentAvailableSupply = ({
  id,
  detailsResponse,
  equityDetailsResponse,
  bondDetailsResponse,
}: DetailsCurrentAvailableSupplyProps) => {
  const { t: tProperties } = useTranslation("properties");

  const { type } = useUserStore();
  const { address: walletAddress } = useWalletStore();

  const { data: availableBalance, isLoading: isAvailableBalanceLoading } =
    useGetBalanceOf(
      new GetAccountBalanceRequest({
        securityId: id,
        targetId: walletAddress,
      }),
    );

  const currentAvailableBalance = toNumber(availableBalance?.value);

  const nominalValue = toNumber(
    equityDetailsResponse?.nominalValue || bondDetailsResponse?.nominalValue,
    2,
  );

  const totalAvailableBalanceValue = nominalValue * currentAvailableBalance;

  if (type !== User.holder) {
    return null;
  }

  return (
    <Panel title={tProperties("currentAvailableBalance")}>
      <Center w="full">
        {isAvailableBalanceLoading ? (
          <SkeletonText skeletonHeight={2} flex={1} noOfLines={1} />
        ) : (
          <Box>
            <Text textStyle="ElementsSemibold2XL">
              {detailsResponse?.totalSupply ?? ""}
              <Text ml={1} as="span" textStyle="ElementsRegularMD">
                {detailsResponse?.symbol ?? ""}
              </Text>
            </Text>
            <Text ml={1} as="span" textStyle="ElementsRegularMD">
              {tProperties("nominalTotalValue")}
              {formatNumberLocale(totalAvailableBalanceValue, 2)}
            </Text>
          </Box>
        )}
      </Center>
    </Panel>
  );
};
