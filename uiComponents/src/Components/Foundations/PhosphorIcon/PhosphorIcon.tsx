import type { ComponentSingleStyleConfig as ChakraComponentSingleStyleConfig } from "@chakra-ui/react";
import { useStyleConfig as useChakraStyleConfig } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type { BaseIconProps } from "@/Components/Foundations/Icon";
import { Icon } from "@/Components/Foundations/Icon";
import { merge as _merge } from "lodash";
import React from "react";

export enum Weight {
  Thin = "thin",
  Light = "light",
  Regular = "regular",
  Bold = "bold",
  Fill = "fill",
  Duotone = "duotone",
}

export interface PhosphorIconThemeConfiguration
  extends ChakraComponentSingleStyleConfig {
  baseStyle?:
    | (() => Partial<PhosphorIconThemeStyle>)
    | Partial<PhosphorIconThemeStyle>;
  sizes?: Record<string, Partial<PhosphorIconThemeStyle>>;
}

export interface PhosphorIconProps extends BaseIconProps {
  weight?: Weight;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as: any;
}

type PhosphorIconThemeStyle = ChakraSystemStyleObject & {
  weight: PhosphorIconProps["weight"];
};

export const PhosphorIcon = ({
  weight,
  size,
  variant,
  as,
  __css,
  ...props
}: PhosphorIconProps) => {
  if (!as) {
    throw new Error("Icon was not provided in prop `as`.");
  }

  const { weight: themeWeight = Weight.Regular, ...themeStyles } =
    useChakraStyleConfig("PhosphorIcon", {
      size,
      variant,
    }) as PhosphorIconThemeStyle;

  const styles = _merge(themeStyles, __css);

  const iconWeight: Weight = weight || themeWeight;
  return <Icon as={as} weight={iconWeight} __css={styles} {...props} />;
};
