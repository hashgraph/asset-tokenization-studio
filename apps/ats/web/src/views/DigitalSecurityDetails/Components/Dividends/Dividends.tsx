// SPDX-License-Identifier: Apache-2.0

import { Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { ProgramDividend } from "./ProgramDividend";
import { SeeDividend } from "./SeeDividend";
import { PanelTabs } from "../../../../components/PanelTabs/PanelTabs";
import { DividendsHolders } from "./DividendsHolders";
import { DividendsList } from "./DividendsList";

export const Dividends = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.dividends.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container" pt={0}>
      <PanelTabs
        tabs={[
          { content: <DividendsList />, header: tTabs("list") },
          { content: <ProgramDividend />, header: tTabs("program") },
          { content: <SeeDividend />, header: tTabs("see") },
          { content: <DividendsHolders />, header: tTabs("holders") },
        ]}
        isFitted
        variant="secondary"
      />
    </Stack>
  );
};
