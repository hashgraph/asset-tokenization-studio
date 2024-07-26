import { Flex, VStack } from "@chakra-ui/react";
import type { StackProps } from "@chakra-ui/react";
import { Breadcrumb } from "@hashgraph/assettokenization-uicomponents/Navigation";
import { GobackButton, GobackButtonProps } from "./GobackButton";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import type { Options } from "use-react-router-breadcrumbs";

export interface HistoryProps extends StackProps {
  label: GobackButtonProps["label"];
  to?: GobackButtonProps["to"];
  excludePaths?: Options["excludePaths"];
}

export const History = (props: HistoryProps) => {
  const { label, to, excludePaths, ...stackProps } = props;
  const routes = useBreadcrumbs({ excludePaths });

  return (
    <VStack alignItems="left" gap="24px" {...stackProps}>
      <Flex gap="24px" align="center">
        <GobackButton label={label} to={to} />
      </Flex>
      <Breadcrumb items={routes} />
    </VStack>
  );
};
