import React from "react";
import type { tagAnatomy as ChakraTagAnatomy } from "@chakra-ui/anatomy";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
  chakra,
} from "@chakra-ui/system";
import type { TagProps as ChakraTagProps } from "@chakra-ui/tag";
import type {
  SystemStyleObject as ChakraSystemStyleObject,
  ComponentWithAs,
} from "@chakra-ui/system";
import { Tag as ChakraTag, TagLabel as ChakraTagLabel } from "@chakra-ui/tag";
import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@/Theme/Components/BaseMultiStyleConfiguration";
import { SkeletonCircle } from "@chakra-ui/react";

export const tagPartsList: typeof ChakraTagAnatomy.keys = [
  "container",
  "label",
];

type Parts = typeof tagPartsList;

export type TagConfigProps = {
  disabled?: boolean;
};

type TagThemeStyle = Partial<Record<Parts[number], ChakraSystemStyleObject>>;

export interface TagThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle?:
    | ((props: TagConfigProps) => TagThemeStyle)
    | PartsStyleInterpolation<Parts>;
  sizes?: Record<string, TagThemeStyle>;
}
export interface TagProps extends Omit<ChakraTagProps, "children"> {
  label?: string;
  icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement<
    any,
    string | React.JSXElementConstructor<any>
  >;
  disabled?: boolean;
  isLoading?: boolean;
}
export const Tag: ComponentWithAs<"span", TagProps> = forwardRef<
  TagProps,
  "span"
>(
  (
    {
      label = "",
      icon,
      disabled,
      leftIcon,
      rightIcon,
      isLoading,
      ...props
    }: TagProps,
    ref
  ) => {
    const styles = useChakraMultiStyleConfig("Tag", {
      disabled,
      size: props.size,
      variant: props.variant,
    });

    const renderIcon = (icon: React.ReactElement, options?: any) => {
      return React.cloneElement(icon, {
        size: "xxs",
        verticalAlign: "top",
        ...options,
      });
    };

    if (isLoading) {
      return <SkeletonCircle size="8" w={20} />;
    }

    return (
      <ChakraTag as={chakra.button} ref={ref} sx={styles.container} {...props}>
        {leftIcon && renderIcon(leftIcon)}
        {icon ? (
          renderIcon(icon)
        ) : (
          <ChakraTagLabel sx={styles.label}>{label}</ChakraTagLabel>
        )}
        {rightIcon && renderIcon(rightIcon)}
      </ChakraTag>
    );
  }
);
