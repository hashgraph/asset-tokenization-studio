import { Stack } from "@chakra-ui/react";
import { Tabs } from "@hashgraph/asset-tokenization-uicomponents/DataDisplay/Tabs";
import { useTranslation } from "react-i18next";
import { ProgramVotingRights } from "./ProgramVotingRights";
import { SeeVotingRights } from "./SeeVotingRights";

export const VotingRights = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.votingRights.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container">
      <Tabs
        tabs={[
          { content: <ProgramVotingRights />, header: tTabs("program") },
          { content: <SeeVotingRights />, header: tTabs("see") },
        ]}
        isFitted
      />
    </Stack>
  );
};
