// SPDX-License-Identifier: Apache-2.0

import { Center, SkeletonText, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Text } from "io-bricks-ui";
import { SecurityDetails } from "../views/DigitalSecurityDetails/Components/SecurityDetails";
import { Panel } from "./Panel";
import { useSecurityStore } from "../store/securityStore";

export interface DetailsBalancePanelProps {
  balance?: string;
  isLoading?: boolean;
  title?: string;
}

export const DetailsBalancePanel = ({ balance = "", isLoading = true, title }: DetailsBalancePanelProps) => {
  const { t: tProperties } = useTranslation("properties");
  const { details } = useSecurityStore();

  return (
    <Stack w="472px" gap={8}>
      <Panel
        data-testid="current-available-balance-panel"
        title={title ?? tProperties("currentAvailableBalance")}
        background="neutral.white"
      >
        <Center w="full" minH={8}>
          {isLoading ? (
            <Stack w="40%">
              <SkeletonText data-testid="skeleton" skeletonHeight={2} flex={1} noOfLines={1} />
            </Stack>
          ) : (
            <Text textStyle="ElementsSemibold2XL">
              {balance}
              <Text ml={1} as="span" textStyle="ElementsRegularMD">
                {details?.symbol ?? ""}
              </Text>
            </Text>
          )}
        </Center>
      </Panel>
      <SecurityDetails layerStyle="whiteContainer" />
    </Stack>
  );
};
