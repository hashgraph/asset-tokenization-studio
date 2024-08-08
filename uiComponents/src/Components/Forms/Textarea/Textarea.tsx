import type {
  SystemStyleObject as ChakraSystemStyleConfig,
  ComponentWithAs,
} from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import { FormLabel as ChakraFormLabel } from "@chakra-ui/form-control";
import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from "@chakra-ui/textarea";
import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@Theme/Components/BaseMultiStyleConfiguration";
import React from "react";
import { Text } from "@/Components/Foundations/Text";
import { Box } from "@chakra-ui/react";

export const textareaPartsList: Array<
  "labelContainer" | "label" | "container" | "length"
> = ["container", "label", "labelContainer", "length"];

type Parts = typeof textareaPartsList;

export type TextareaConfigProps = {
  variant: TextareaProps["variant"];
  isInvalid?: boolean;
  isSuccess?: boolean;
  isDisabled?: boolean;
  hasLabel?: boolean;
};
export interface TextareaThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (({
        variant,
        isInvalid,
        isDisabled,
      }: TextareaConfigProps) => Partial<
        Record<Parts[number], ChakraSystemStyleConfig>
      >)
    | PartsStyleInterpolation<Parts>;
}

export interface TextareaProps extends ChakraTextareaProps {
  isSuccess?: boolean;
  label?: string;
  showRequired?: boolean;
}

export const Textarea: ComponentWithAs<"textarea", TextareaProps> = forwardRef<
  TextareaProps,
  "textarea"
>(
  (
    {
      size,
      variant,
      isInvalid,
      isSuccess,
      isDisabled,
      isRequired,
      label,
      showRequired = true,
      id,
      value,
      maxLength,
      ...props
    }: TextareaProps,
    ref
  ) => {
    const styles = useChakraMultiStyleConfig("Textarea", {
      size,
      variant,
      isInvalid,
      isSuccess,
      isDisabled,
      hasLabel: Boolean(label),
    });

    return (
      <ChakraFormLabel
        sx={styles.labelContainer}
        htmlFor={id}
        flex={1}
        position="relative"
        ref={ref}
      >
        {label && (
          <Text as="span" id="label" display="flex" sx={styles.label}>
            {label}
            {showRequired && isRequired && "*"}
          </Text>
        )}
        <Box pos="relative">
          <ChakraTextarea
            variant={variant}
            size={size}
            ref={ref}
            id={id}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            value={value}
            maxLength={maxLength}
            sx={styles.container}
            {...props}
          />
          {maxLength && (
            <Text sx={styles.length}>
              {value?.toString().length || 0}/{maxLength}
            </Text>
          )}
        </Box>
      </ChakraFormLabel>
    );
  }
);
