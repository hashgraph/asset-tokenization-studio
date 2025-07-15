import { Box } from "@chakra-ui/react";
import { Tabs } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { Locker } from "../Locker/Locker";
import { Hold } from "../Hold/Hold";
import { Cap } from "../Cap/Cap";
import { ClearingOperations } from "../ClearingOperations/ClearingOperations";
import { useMemo } from "react";
import { AdminActionsButtons } from "../AdminActionsButtons";

interface OperationsTabProps {
  config: {
    showLocker: boolean;
    showHold: boolean;
    showCap: boolean;
    showClearingOperations: boolean;
  };
}

export const OperationsTab = ({ config }: OperationsTabProps) => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.tabs",
  });

  const tabs = useMemo(() => {
    const tabs = [];

    if (config.showLocker) {
      tabs.push({ content: <Locker />, header: tTabs("locker") });
    }
    if (config.showHold) {
      tabs.push({ content: <Hold />, header: tTabs("hold") });
    }
    if (config.showCap) {
      tabs.push({ content: <Cap />, header: tTabs("cap") });
    }
    if (config.showClearingOperations) {
      tabs.push({
        content: <ClearingOperations />,
        header: tTabs("clearingOperations"),
      });
    }

    return tabs;
  }, [config, tTabs]);

  return (
    <Box w={"full"} h={"full"}>
      <AdminActionsButtons />
      <Tabs tabs={tabs} variant="secondary" />
    </Box>
  );
};
