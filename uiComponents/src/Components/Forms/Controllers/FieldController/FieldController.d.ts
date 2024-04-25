import type { FormErrorMessageProps as ChakraFormErrorMessageProps } from "@chakra-ui/react";
import type { ControllerFieldState } from "react-hook-form";
import React from "react";
export interface FieldControllerProps {
    children: React.ReactNode;
    fieldState: ControllerFieldState;
    showErrors?: boolean;
    errorMessageVariant: ChakraFormErrorMessageProps["variant"];
}
export declare const FieldController: ({ children, fieldState, errorMessageVariant, showErrors, }: FieldControllerProps) => JSX.Element;
