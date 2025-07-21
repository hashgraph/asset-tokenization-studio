import { Box } from "@chakra-ui/react";
import { Tabs } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { BalanceAdjustment } from "../BalanceAdjustment/BalanceAdjustment";
import { Dividends } from "../Dividends/Dividends";
import { VotingRights } from "../VotingRights/VotingRights";
import { Coupons } from "../Coupons/Coupons";
import { useMemo } from "react";

interface OperationsTabProps {
  config: {
    showBalanceAdjustment: boolean;
    showDividends: boolean;
    showVotingRights: boolean;
    showCoupons: boolean;
  };
}

export const CorporateActionsTab = ({ config }: OperationsTabProps) => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.tabs",
  });

  const tabs = useMemo(() => {
    const tabs = [];

    if (config.showBalanceAdjustment) {
      tabs.push({
        content: <BalanceAdjustment />,
        header: tTabs("balanceAdjustment"),
      });
    }
    if (config.showDividends) {
      tabs.push({ content: <Dividends />, header: tTabs("dividends") });
    }
    if (config.showVotingRights) {
      tabs.push({ content: <VotingRights />, header: tTabs("votingRights") });
    }
    if (config.showCoupons) {
      tabs.push({
        content: <Coupons />,
        header: tTabs("coupons"),
      });
    }

    return tabs;
  }, [config, tTabs]);

  return (
    <Box w={"full"} h={"full"}>
      <Tabs tabs={tabs} variant="secondary" />
    </Box>
  );
};
