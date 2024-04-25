import type { BaseSingleStyleConfiguration } from "@/Theme/Components/BaseSingleStyleConfiguration";
import type { LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import {
  Link as ChakraLink,
  forwardRef,
  useStyleConfig as useChakraStyleConfig,
} from "@chakra-ui/react";
import type { ComponentWithAs, SystemStyleObject } from "@chakra-ui/system";
import React from "react";

export interface LinkProps extends ChakraLinkProps {
  isDisabled?: boolean;
  variant?: ChakraLinkProps["variant"];
}

export interface LinkThemeConfiguration extends BaseSingleStyleConfiguration {
  variants?: {
    [key: string]:
      | ((props: LinkProps) => Partial<SystemStyleObject>)
      | Partial<SystemStyleObject>;
  };
}

export const Link: ComponentWithAs<"a", LinkProps> = forwardRef<LinkProps, "a">(
  ({ children, variant, isDisabled, sx, ...props }: LinkProps, ref) => {
    const themeStyles = useChakraStyleConfig("Link", {
      isDisabled,
      variant,
    });

    return (
      <ChakraLink
        data-testid="link"
        ref={ref}
        as={isDisabled ? "span" : "a"}
        tabIndex={0}
        sx={themeStyles}
        variant={variant}
        {...props}
        onClick={isDisabled ? () => false : props.onClick}
      >
        {children}
      </ChakraLink>
    );
  }
);
