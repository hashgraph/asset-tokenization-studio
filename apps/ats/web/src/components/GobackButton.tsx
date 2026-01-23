// SPDX-License-Identifier: Apache-2.0

import { IconButton, Text, PhosphorIcon } from "io-bricks-ui";
import { Flex, FlexProps } from "@chakra-ui/react";
import { ArrowLeft } from "@phosphor-icons/react";
import { Link as RouterLink } from "react-router-dom";
import type { To } from "react-router-dom";
import { RouterManager } from "../router/RouterManager";
import { useLocationStore } from "../store/locationStore";
import { RoutePath } from "../router/RoutePath";

export interface GobackButtonProps extends FlexProps {
  label: string;
  to?: To;
}

export const GobackButton = (props: GobackButtonProps) => {
  const { label, to, ...buttonProps } = props;
  const { locations } = useLocationStore();

  const shouldReplaceGobackRoute =
    locations[locations.length - 2]?.includes("/create") || locations[locations.length - 2]?.includes("/add");

  return (
    <Flex data-testid="go-back-button" gap="24px" align="center" {...buttonProps}>
      <IconButton
        data-testid="go-back-button-button"
        aria-label="Go back"
        icon={<PhosphorIcon as={ArrowLeft} />}
        size="md"
        variant="secondary"
        {...(to
          ? {
              as: RouterLink,
              to: shouldReplaceGobackRoute ? RoutePath.DASHBOARD : to,
            }
          : {
              onClick: shouldReplaceGobackRoute ? () => RouterManager.goDashboard() : () => RouterManager.goBack(),
            })}
      />
      <Text data-testid="go-back-button-label" textStyle="HeadingBoldXL">
        {label}
      </Text>
    </Flex>
  );
};
