import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import {
  Flex,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import React from "react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import { Text } from "@/Components/Foundations/Text";
import type { TextProps } from "@/Components/Foundations/Text";
import type { FlexProps } from "@chakra-ui/react";

export const panelTitlePartsList: Array<"title" | "container"> = [
  "title",
  "container",
];

type Parts = typeof panelTitlePartsList;

export interface PanelTitleThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

type PanelTitleThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;

export interface PanelTitleProps extends Omit<FlexProps, "children"> {
  title: string;
  titleProps?: TextProps;
}

export const PanelTitle = ({
  title,
  titleProps,
  ...props
}: PanelTitleProps) => {
  const styles = useChakraMultiStyleConfig(
    "PanelTitle"
  ) as PanelTitleThemeStyle;
  return (
    <Flex sx={styles.container} {...props}>
      <Text sx={styles.title} {...titleProps}>
        {title}
      </Text>
    </Flex>
  );
};
