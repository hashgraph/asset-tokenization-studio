import React from "react";
import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/button";
import { Button as ChakraButton } from "@chakra-ui/button";
import { useStyleConfig } from "@chakra-ui/react";
import type { ComponentWithAs } from "@chakra-ui/system";
import { forwardRef } from "@chakra-ui/system";
import type { BaseSingleStyleConfiguration } from "@Theme/Components/BaseSingleStyleConfiguration";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Plus } from "@phosphor-icons/react";

export interface AddAreaButtonProps extends ChakraButtonProps {}

export interface AddAreaButtonThemeConfiguration
  extends BaseSingleStyleConfiguration {}

export const AddAreaButton: ComponentWithAs<"button", AddAreaButtonProps> =
  forwardRef<AddAreaButtonProps, "button">(
    ({ children, ...props }: AddAreaButtonProps, ref) => {
      const styles = useStyleConfig("AddAreaButton", {
        variant: props.variant,
        size: props.size,
      });

      return (
        <ChakraButton
          data-testid="add-area-button"
          ref={ref}
          sx={styles}
          gap={2}
          {...props}
        >
          <PhosphorIcon as={Plus} size="xs" />
          {children}
        </ChakraButton>
      );
    }
  );
