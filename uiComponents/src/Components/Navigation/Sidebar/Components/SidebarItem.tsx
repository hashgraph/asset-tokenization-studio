import React from "react";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import type {
  PhosphorIconProps,
  Weight,
} from "@/Components/Foundations/PhosphorIcon";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { useHover } from "@/Hooks";
import type { FlexProps as ChakraFlexProps } from "@chakra-ui/react";
import {
  Center as ChakraCenter,
  Flex as ChakraFlex,
  useMergeRefs as useChakraMergeRefs,
} from "@chakra-ui/react";
import type {
  SystemStyleObject as ChakraSystemStyleObject,
  ComponentWithAs,
} from "@chakra-ui/system";
import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@/Theme/Components/BaseMultiStyleConfiguration";
export const sidebarPartsList: Array<
  "iconWeight" | "icon" | "label" | "container"
> = ["iconWeight", "icon", "label", "container"];

type Parts = typeof sidebarPartsList;

export type SidebarItemConfigProps = {
  isDisabled?: boolean;
  isHovered?: boolean;
  isActive?: boolean;
};

export interface SidebarItemThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (({
        isHovered,
        isDisabled,
        isActive,
      }: SidebarItemConfigProps) => Partial<SidebarItemThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

export interface SidebarItemProps extends ChakraFlexProps {
  isActive?: boolean;
  isDisabled?: boolean;
  label: string;
  icon: PhosphorIconProps["as"];
}

export type SidebarItemThemeStyle = Record<
  Parts[number],
  ChakraSystemStyleObject
> & {
  iconWeight: Weight;
};

export const SidebarItem: ComponentWithAs<"button", SidebarItemProps> =
  forwardRef<SidebarItemProps, "button">(
    (
      { isActive, isDisabled, label, icon, ...props }: SidebarItemProps,
      ref
    ) => {
      const [containerRef, isHovered] = useHover();
      const refs = useChakraMergeRefs(containerRef, ref);
      const styles = useChakraMultiStyleConfig("SidebarItem", {
        isHovered,
        isActive,
        isDisabled,
      }) as SidebarItemThemeStyle;

      return (
        <ChakraFlex
          align="center"
          direction="column"
          outline="none"
          // as="button"
          data-testid={`sidebar-item-${label}`}
          disabled={isDisabled}
          ref={refs}
          {...props}
          sx={styles.container}
        >
          <ChakraCenter as="button" sx={styles.icon}>
            <PhosphorIcon size="xs" as={icon} weight={styles.iconWeight} />
          </ChakraCenter>
          <Text sx={styles.label}>{label} </Text>
        </ChakraFlex>
      );
    }
  );
