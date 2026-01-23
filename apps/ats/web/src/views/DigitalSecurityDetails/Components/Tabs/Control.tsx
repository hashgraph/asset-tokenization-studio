import { Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { KYC } from "../KYC/KYC";
import { SSIManager } from "../SSIManager/SSIManager";
import { ControlList } from "../ControlList";
import { SecurityViewModel } from "@hashgraph/asset-tokenization-sdk";
import { useMemo } from "react";
import { ExternalPause } from "../ExternalPause/ExternalPause";
import { ExternalControl } from "../ExternalControl/ExternalControl";
import { ExternalKYC } from "../ExternalKYC/ExternalKYC";
import { AdminControlActionsButtons } from "../AdminControlActionsButtons";
import { Tabs } from "io-bricks-ui";
import { ProceedRecipients } from "../ProceedRecipients/ProceedRecipients";

interface ControlTabProps {
  details: SecurityViewModel;
  config: {
    showProceedRecipients: boolean;
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

    if (config.showProceedRecipients) {
      tabs.push({
        content: <ProceedRecipients />,
        header: tTabs("proceedRecipients"),
      });
    }
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
    tabs.push({ content: <ExternalPause />, header: tTabs("externalPause") });
    tabs.push({
      content: <ExternalControl />,
      header: tTabs("externalControlList"),
    });
    tabs.push({
      content: <ExternalKYC />,
      header: tTabs("externalKYCList"),
    });

    return tabs;
  }, [config, tTabs, isWhiteList]);

  return (
    <Box w={"full"} h={"full"}>
      <AdminControlActionsButtons />
      <Tabs tabs={tabs} variant="secondary" isLazy />
    </Box>
  );
};
