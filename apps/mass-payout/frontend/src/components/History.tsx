// SPDX-License-Identifier: Apache-2.0

import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import { Flex, VStack } from "@chakra-ui/react";
import type { StackProps } from "@chakra-ui/react";
import { Breadcrumb } from "io-bricks-ui";
import type { Options } from "use-react-router-breadcrumbs";
import { GobackButtonProps, GobackButton } from "./GobackButton";

export interface HistoryProps extends StackProps {
  label: GobackButtonProps["label"];
  to?: GobackButtonProps["to"];
  excludePaths?: Options["excludePaths"];
}

export const History = (props: HistoryProps) => {
  const { label, to, excludePaths, ...stackProps } = props;
  const routes = useBreadcrumbs({ excludePaths });

  return (
    <VStack alignItems="left" gap="12px" {...stackProps}>
      <Breadcrumb items={routes} />
      <Flex gap="24px" align="center">
        <GobackButton label={label} to={to} />
      </Flex>
    </VStack>
  );
};
