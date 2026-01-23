// SPDX-License-Identifier: Apache-2.0

import { IconButton, Text, PhosphorIcon } from "io-bricks-ui";
import { Flex, FlexProps } from "@chakra-ui/react";
import { ArrowLeft } from "@phosphor-icons/react";
import { Link as RouterLink } from "react-router-dom";
import type { To } from "react-router-dom";
import { RouterManager } from "../router/RouterManager";
import { RouteName } from "../router/RouteName";
import { useLocationStore } from "@/store/locationStore";

export interface GobackButtonProps extends FlexProps {
  label: string;
  to?: To;
}

export const GobackButton = (props: GobackButtonProps) => {
  const { label, to, ...buttonProps } = props;
  const { getGoBackPath, getGoBackAction } = useLocationStore();

  const navigationActions = {
    "navigate-to-assets": () => RouterManager.to(RouteName.Assets),
    "navigate-to-landing": () => RouterManager.goLanding(),
    "navigate-back": () => RouterManager.goBack(),
  } as const;

  const handleGoBack = () => {
    const action = getGoBackAction();
    const navigationFunction = navigationActions[action] || navigationActions["navigate-back"];
    navigationFunction();
  };

  return (
    <Flex data-testid="go-back-button" gap={6} align="center" {...buttonProps}>
      <IconButton
        data-testid="go-back-button-button"
        aria-label="Go back"
        icon={<PhosphorIcon as={ArrowLeft} />}
        size="md"
        variant="secondary"
        {...(to
          ? {
              as: RouterLink,
              to: getGoBackPath(typeof to === "string" ? to : undefined),
            }
          : {
              onClick: handleGoBack,
            })}
      />
      <Text data-testid="go-back-button-label" textStyle="HeadingBoldXL" color="neutral.800">
        {label}
      </Text>
    </Flex>
  );
};
