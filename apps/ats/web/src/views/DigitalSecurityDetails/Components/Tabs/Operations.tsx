import { Box, HStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Locker } from "../Locker/Locker";
import { Hold } from "../Hold/Hold";
import { Cap } from "../Cap/Cap";
import { ClearingOperations } from "../ClearingOperations/ClearingOperations";
import { ReactElement, useMemo, useState } from "react";
import { AdminActionsButtons } from "../AdminActionsButtons";
import { SegmentedButton } from "../../../../components/SegmentedButton";
import { PanelTabs } from "../../../../components/PanelTabs/PanelTabs";
import { Freeze } from "../Freeze/Freeze";

interface OperationsTabProps {
  config: {
    showLocker: boolean;
    showHold: boolean;
    showCap: boolean;
    showClearingOperations: boolean;
    showFreeze: boolean;
  };
}

type TabConfigKey = keyof OperationsTabProps["config"];

export type OperationContractType = "ERC 1400" | "ERC 3643";

interface OperationTab {
  component: ReactElement;
  key: string;
  configKey?: TabConfigKey;
}

const operationContractTabs: Record<OperationContractType, OperationTab[]> = {
  "ERC 1400": [
    { component: <Locker />, key: "locker", configKey: "showLocker" },
    { component: <Hold />, key: "hold", configKey: "showHold" },
    { component: <Cap />, key: "cap", configKey: "showCap" },
    {
      component: <ClearingOperations />,
      key: "clearingOperations",
      configKey: "showClearingOperations",
    },
  ],
  "ERC 3643": [{ component: <Freeze />, key: "freeze", configKey: "showFreeze" }],
};

export const OperationsTab = ({ config }: OperationsTabProps) => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.tabs",
  });

  const [selectedOperationContractType, setSelectedOperationContractType] = useState<OperationContractType>("ERC 1400");

  const tabs = useMemo(() => {
    const currentTabs = operationContractTabs[selectedOperationContractType];

    return currentTabs
      .filter((tab) => (tab.configKey ? config[tab.configKey] : true))
      .map((tab) => ({
        content: tab.component,
        header: tTabs(tab.key),
      }));
  }, [selectedOperationContractType, config, tTabs]);

  return (
    <Box w={"full"} h={"full"}>
      <HStack align={"center"} pb={6}>
        <SegmentedButton
          selectedOperationContractType={selectedOperationContractType}
          setSelectedOperationContractType={setSelectedOperationContractType}
        />
        <AdminActionsButtons />
      </HStack>
      {tabs.length > 0 && <PanelTabs tabs={tabs} />}
    </Box>
  );
};
