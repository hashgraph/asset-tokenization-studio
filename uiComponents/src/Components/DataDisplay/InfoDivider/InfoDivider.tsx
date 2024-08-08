import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { SimpleGridProps as ChakraSimpleGridProps } from "@chakra-ui/react";
import {
  SimpleGrid as ChakraSimpleGrid,
  Divider as ChakraDivider,
  Flex as ChakraFlex,
  useMultiStyleConfig as useChakraMultiStyleConfig,
  Skeleton,
} from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import React from "react";
import { Text } from "../../Foundations/Text";

export const infoDividerPartsList: Array<
  "container" | "titleContainer" | "number" | "step" | "title" | "divider"
> = ["container", "titleContainer", "number", "step", "title", "divider"];

type Parts = typeof infoDividerPartsList;

type InfoDividerType = "main" | "secondary";
export type InfoDividerConfigProps = {
  type: InfoDividerType;
  hasStep: boolean;
  hasNumber: boolean;
};

export interface InfoDividerThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | ((args: InfoDividerConfigProps) => Partial<InfoDividerThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

export interface InfoDividerProps extends Omit<ChakraSimpleGridProps, "as"> {
  title: string;
  number?: number;
  step?: number;
  type: InfoDividerType;
  as?: "div" | "legend";
  isLoading?: boolean;
}

export type InfoDividerThemeStyle = Record<
  Parts[number],
  ChakraSystemStyleObject
>;

export const InfoDivider = ({
  title,
  number,
  step,
  type,
  as = "div",
  isLoading,
  ...props
}: InfoDividerProps) => {
  const styles = useChakraMultiStyleConfig("InfoDivider", {
    type,
    hasStep: step !== undefined,
    hasNumber: number !== undefined,
  }) as InfoDividerThemeStyle;

  return (
    <ChakraSimpleGrid
      data-testid="info-divider"
      as={as}
      {...props}
      sx={styles.container}
    >
      {isLoading ? (
        <Skeleton w={20} h={4} />
      ) : (
        <ChakraFlex sx={styles.titleContainer}>
          {number && (
            <Text sx={styles.number}>{String(number).padStart(2, "0")}</Text>
          )}
          {step && type === "main" && <Text sx={styles.step}>{step}</Text>}
          <Text sx={styles.title}>{title}</Text>
        </ChakraFlex>
      )}

      <ChakraDivider orientation="horizontal" sx={styles.divider} />
    </ChakraSimpleGrid>
  );
};
