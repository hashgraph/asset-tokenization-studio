import { type ReactNode } from "react";
import type { ComponentWithAs } from "@chakra-ui/system";
import { type Props as ChakraSelectProps } from "chakra-react-select";
export interface SelectProps extends Omit<ChakraSelectProps, "size" | "tagVariant" | "chakraStyles" | "variant"> {
    variant?: ChakraSelectProps["variant"] | string;
    addonLeft?: ReactNode;
    addonRight?: ReactNode;
    dropdownIndicator?: ReactNode;
    loadingIndicator?: ReactNode;
    size?: ChakraSelectProps["size"] | string;
    overrideStyles?: ChakraSelectProps["chakraStyles"];
    label?: string;
    showRequired?: boolean;
    isRequired?: boolean;
}
export declare const Select: ComponentWithAs<"select", SelectProps>;
