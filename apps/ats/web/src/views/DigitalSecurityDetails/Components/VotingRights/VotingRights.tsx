// SPDX-License-Identifier: Apache-2.0

import { Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { ProgramVotingRights } from "./ProgramVotingRights";
import { SeeVotingRights } from "./SeeVotingRights";
import { PanelTabs } from "../../../../components/PanelTabs/PanelTabs";

export const VotingRights = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.votingRights.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PanelTabs
        tabs={[
          { content: <ProgramVotingRights />, header: tTabs("program") },
          { content: <SeeVotingRights />, header: tTabs("see") },
        ]}
        isFitted
      />
    </Stack>
  );
};
