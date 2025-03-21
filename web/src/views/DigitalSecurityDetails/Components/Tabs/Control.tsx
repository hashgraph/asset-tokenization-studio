import { Box } from "@chakra-ui/react";
import { Tabs } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { KYC } from "../KYC/KYC";
import { SSIManager } from "../SSIManager/SSIManager";
import { ControlList } from "../ControlList";
import { SecurityViewModel } from "@hashgraph/asset-tokenization-sdk";
import { useMemo } from "react";

interface ControlTabProps {
  details: SecurityViewModel;
  config: {
    showControlList: boolean;
    showKYC: boolean;
    showSSIManager: boolean;
  };
}

export const ControlTab = ({ details, config }: ControlTabProps) => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.tabs",
  });

  const isWhiteList = details.isWhiteList;

  const tabs = useMemo(() => {
    const tabs = [];

    if (config.showControlList) {
      tabs.push({
        content: <ControlList />,
        header: isWhiteList ? tTabs("allowedList") : tTabs("blockedList"),
      });
    }
    if (config.showKYC) {
      tabs.push({ content: <KYC />, header: tTabs("kyc") });
    }
    if (config.showSSIManager) {
      tabs.push({ content: <SSIManager />, header: tTabs("ssiManager") });
    }

    return tabs;
  }, [config, tTabs, isWhiteList]);

  return (
    <Box w={"full"} h={"full"}>
      <Tabs tabs={tabs} variant="secondary" />
    </Box>
  );
};
