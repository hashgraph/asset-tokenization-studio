import React from "react";
import type { IconButtonProps as ChakraIconButtonProps } from "@chakra-ui/button";
import { IconButton as ChakraIconButton } from "@chakra-ui/button";
import type { SystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import {
  forwardRef,
  useStyleConfig as useChakraStyleConfig,
} from "@chakra-ui/system";
import _merge from "lodash/merge";
import type { BaseSingleStyleConfiguration } from "@Theme/Components/BaseSingleStyleConfiguration";
import type { ButtonVariantProps } from "../../Interaction/Button";

export type Variant = "primary" | "secondary" | "tertiary" | string;

export interface IconButtonProps extends ChakraIconButtonProps {
  variant?: Variant;
  status?: string;
}

export interface IconButtonThemeConfiguration
  extends Omit<BaseSingleStyleConfiguration, "variants"> {
  baseStyle: Partial<SystemStyleObject>;
  variants?: {
    [key: string]:
      | ((props: ButtonVariantProps) => Partial<SystemStyleObject>)
      | Partial<SystemStyleObject>;
  };
}

export const IconButton: ComponentWithAs<"button", IconButtonProps> =
  forwardRef<IconButtonProps, "button">(
    (
      { size, variant, icon, color, sx, status, ...props }: IconButtonProps,
      ref
    ) => {
      const themeStyles = useChakraStyleConfig("IconButton", {
        size,
        variant,
        color,
        status,
      });

      const styles = React.useMemo(
        () => _merge(themeStyles, sx),
        [themeStyles, sx]
      );

      return <ChakraIconButton ref={ref} sx={styles} {...props} icon={icon} />;
    }
  );
