import type { ComponentWithAs } from "@chakra-ui/system";
import { createIcon as createChakraIcon } from "@chakra-ui/icon";
import { forwardRef, useTheme as useChakraTheme } from "@chakra-ui/system";
import type { ConfigurationIcons } from "@Theme/icons";
import _merge from "lodash/merge";
import React from "react";
import type { BaseIconProps } from "@/Components/Foundations/Icon";

export interface CustomIconProps extends BaseIconProps {
  name: string;
}

export const CustomIcon: ComponentWithAs<"svg", CustomIconProps> = forwardRef<
  CustomIconProps,
  "svg"
>(({ name, ...props }: CustomIconProps, ref) => {
  const { icons: configIcons }: { icons: ConfigurationIcons } =
    useChakraTheme();

  if (!(name in configIcons)) {
    throw new Error(`Icon '${name}' not found.`);
  }

  const options = _merge(configIcons[name], {
    displayName: name,
    defaultProps: props,
  });

  const NewIcon = createChakraIcon(options);

  return <NewIcon ref={ref} />;
});
