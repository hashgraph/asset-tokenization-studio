// SPDX-License-Identifier: Apache-2.0

import { Link as RouterLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HStack } from "@chakra-ui/react";
import { Button } from "io-bricks-ui";
import { RouteName } from "../../../router/RouteName";
import { RouterManager } from "../../../router/RouterManager";
import { useGetIsPaused } from "../../../hooks/queries/useGetSecurityDetails";
import { PauseRequest } from "@hashgraph/asset-tokenization-sdk";

export const HolderActionsButtons = () => {
  const { t: tButtons } = useTranslation("security", {
    keyPrefix: "details.actions",
  });
  const { id = "" } = useParams();
  const { data: isPaused } = useGetIsPaused(new PauseRequest({ securityId: id }));

  if (isPaused) return <></>;

  return (
    <HStack data-testid="holder-actions-buttons" w="full" justifyContent="flex-end" gap={4}>
      <Button
        data-testid="transfer-button"
        as={RouterLink}
        to={RouterManager.getUrl(RouteName.DigitalSecurityTransfer, {
          params: { id },
        })}
        variant="secondary"
      >
        {tButtons("transfer")}
      </Button>
      <Button
        data-testid="redeem-button"
        as={RouterLink}
        to={RouterManager.getUrl(RouteName.DigitalSecurityRedeem, {
          params: { id },
        })}
        variant="secondary"
      >
        {tButtons("redeem")}
      </Button>
    </HStack>
  );
};
