import { Stack } from "@chakra-ui/react";
import { Tabs } from "@hashgraph/securitytoken-uicomponents/DataDisplay/Tabs";
import { useTranslation } from "react-i18next";
import { ProgramDividend } from "./ProgramDividend";
import { SeeDividend } from "./SeeDividend";

export const Dividends = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.dividends.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container">
      <Tabs
        tabs={[
          { content: <ProgramDividend />, header: tTabs("program") },
          { content: <SeeDividend />, header: tTabs("see") },
        ]}
        isFitted
      />
    </Stack>
  );
};
