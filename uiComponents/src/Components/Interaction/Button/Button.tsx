import React from "react";
import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/button";
import type { SystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import { Button as ChakraButton } from "@chakra-ui/button";
import { useStyleConfig } from "@chakra-ui/react";
import { forwardRef } from "@chakra-ui/system";
import type { BaseSingleStyleConfiguration } from "@Theme/Components/BaseSingleStyleConfiguration";
import { Spinner } from "../../Indicators/Spinner/Spinner";
import _merge from "lodash/merge";

export type ButtonVariantProps = {
  status: ButtonProps["colorScheme"];
};

export interface ButtonThemeConfiguration
  extends Omit<BaseSingleStyleConfiguration, "variants"> {
  baseStyle: Partial<SystemStyleObject>;
  variants?: {
    [key: string]:
      | ((props: ButtonVariantProps) => Partial<SystemStyleObject>)
      | Partial<SystemStyleObject>;
  };
}

export interface ButtonProps extends ChakraButtonProps {
  status?: string;
}

export const Button: ComponentWithAs<"button", ButtonProps> = forwardRef<
  ButtonProps,
  "button"
>(({ children, sx, status, ...props }: ButtonProps, ref) => {
  const themeStyles = useStyleConfig("Button", {
    ...props,
    status,
  });
  const loadingText =
    typeof children === "string" && !props.loadingText
      ? children
      : props.loadingText;

  const styles = React.useMemo(
    () => _merge(themeStyles, sx),
    [themeStyles, sx]
  );

  return (
    <ChakraButton
      ref={ref}
      loadingText={loadingText}
      spinner={<Spinner size="xxs" />}
      {...props}
      sx={styles}
    >
      {children}
    </ChakraButton>
  );
});
