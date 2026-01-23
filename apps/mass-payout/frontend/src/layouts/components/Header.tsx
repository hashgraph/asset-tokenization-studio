// SPDX-License-Identifier: Apache-2.0

import { Divider, Flex, HStack } from "@chakra-ui/react";
import { Header as HeaderBase, Text, Logo, PhosphorIcon, Weight } from "io-bricks-ui";
import { User } from "@phosphor-icons/react";

export const Header = () => {
  return (
    <HeaderBase
      data-testid="header-layout"
      leftContent={<Logo size="iso" alt="Hedera" height="32px" />}
      rightContent={
        <Flex gap={4} alignItems="center">
          <Divider orientation="vertical" />
          <HStack gap={2}>
            <Text textStyle="ElementsMediumXS" color="neutral.800">
              Admin
            </Text>
            <PhosphorIcon as={User} size="xs" weight={Weight.Light} />
          </HStack>
        </Flex>
      }
      // seems to be that Header does not accept variants
      sx={{
        bg: "neutral.50",
        h: 16,
        pl: 6,
        pr: 8,
        py: 4,
        zIndex: 100,
      }}
    />
  );
};
