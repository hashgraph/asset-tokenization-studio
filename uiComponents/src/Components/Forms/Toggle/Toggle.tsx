import type { switchAnatomy as ChakraSwitchParts } from "@chakra-ui/anatomy";

import {
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
} from "@chakra-ui/react";
import type { SwitchProps as ChakraSwitchProps } from "@chakra-ui/switch";
import { Switch as ChakraSwitch } from "@chakra-ui/switch";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import React from "react";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { ComponentWithAs } from "@chakra-ui/system";

export const togglePartsList: Array<
  (typeof ChakraSwitchParts.keys)[number] | "label"
> = ["container", "track", "thumb", "label"];

type Parts = typeof togglePartsList;

export interface ToggleThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export interface ToggleProps extends Omit<ChakraSwitchProps, "placeholder"> {
  label?: string;
}

export const Toggle: ComponentWithAs<"input", ToggleProps> = forwardRef<
  ToggleProps,
  "input"
>(({ label, ...props }: ToggleProps, ref) => {
  const styles = useChakraMultiStyleConfig("Switch", {
    size: props.size,
    variant: props.variant,
  });
  return (
    <ChakraFlex align="center">
      <ChakraSwitch ref={ref} {...props} />
      <ChakraFormLabel htmlFor={props.id} sx={styles.label}>
        {label}
      </ChakraFormLabel>
    </ChakraFlex>
  );
});
