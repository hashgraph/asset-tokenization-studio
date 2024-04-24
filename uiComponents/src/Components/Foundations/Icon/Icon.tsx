import type { IconProps as ChakraIconProps } from "@chakra-ui/icon";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import { Icon as ChakraIcon } from "@chakra-ui/icon";
import { forwardRef } from "@chakra-ui/system";
import React from "react";
import type { CustomIconProps } from "./CustomIcon";
import { CustomIcon } from "./CustomIcon";
import type { ComponentWithAs } from "@chakra-ui/system";

export type IconButtonType = React.ForwardRefExoticComponent<
  PhosphorIconProps & React.RefAttributes<SVGSVGElement>
>;

export interface BaseIconProps
  extends Omit<ChakraIconProps, "name" | "css" | "weight"> {
  size?: string;
  variant?: string;
}

export type ConditionalIconProps =
  | { name?: false; as: any }
  | { name: CustomIconProps["name"]; as?: never };

export type IconProps = BaseIconProps & ConditionalIconProps;

export const Icon: ComponentWithAs<"svg", BaseIconProps & IconProps> =
  forwardRef<BaseIconProps & IconProps, "svg">(
    ({ name, ...props }: BaseIconProps & IconProps, ref) => {
      if (name) {
        return <CustomIcon ref={ref} name={name} {...props} />;
      }
      return <ChakraIcon ref={ref} {...props} />;
    }
  );
