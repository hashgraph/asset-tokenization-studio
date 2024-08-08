import type { FormErrorMessageProps as ChakraFormErrorMessageProps } from "@chakra-ui/react";
import {
  FormControl as ChakraFormControl,
  FormErrorMessage as ChakraFormErrorMessage,
} from "@chakra-ui/react";
import type { ControllerFieldState } from "react-hook-form";
import React from "react";

export interface FieldControllerProps {
  children: React.ReactNode;
  fieldState: ControllerFieldState;
  showErrors?: boolean;
  errorMessageVariant: ChakraFormErrorMessageProps["variant"];
}

export const FieldController = ({
  children,
  fieldState,
  errorMessageVariant,
  showErrors = true,
}: FieldControllerProps) => {
  const isInvalid = !!fieldState?.error;
  const message = fieldState?.error?.message;

  return (
    <ChakraFormControl isInvalid={isInvalid}>
      {children}
      {showErrors && !!message && (
        <ChakraFormErrorMessage
          data-testid="form-error-message"
          variant={errorMessageVariant}
        >
          {message}
        </ChakraFormErrorMessage>
      )}
    </ChakraFormControl>
  );
};
