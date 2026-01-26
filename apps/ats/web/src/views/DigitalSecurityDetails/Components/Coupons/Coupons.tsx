// SPDX-License-Identifier: Apache-2.0

import { Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { ProgramCoupon } from "./ProgramCoupon";
import { SeeCoupon } from "./SeeCoupon";
import { PanelTabs } from "../../../../components/PanelTabs/PanelTabs";
import { CouponsHolders } from "./CouponsHolders";
import { CouponsList } from "./CouponsList";

export const Coupons = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.coupons.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container" pt={0}>
      <PanelTabs
        tabs={[
          { content: <CouponsList />, header: tTabs("list") },
          { content: <ProgramCoupon />, header: tTabs("program") },
          { content: <SeeCoupon />, header: tTabs("see") },
          { content: <CouponsHolders />, header: tTabs("holders") },
        ]}
        isFitted
        variant="secondary"
      />
    </Stack>
  );
};
