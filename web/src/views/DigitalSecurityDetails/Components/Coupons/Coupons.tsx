import { Stack } from "@chakra-ui/react";
import { Tabs } from "@hashgraph/securitytoken-uicomponents/DataDisplay/Tabs";
import { useTranslation } from "react-i18next";
import { ProgramCoupon } from "./ProgramCoupon";
import { SeeCoupon } from "./SeeCoupon";

export const Coupons = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.coupons.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container">
      <Tabs
        tabs={[
          { content: <ProgramCoupon />, header: tTabs("program") },
          { content: <SeeCoupon />, header: tTabs("see") },
        ]}
        isFitted
      />
    </Stack>
  );
};
