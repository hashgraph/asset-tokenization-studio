import React, { type ReactNode } from "react";
import {
  FormLabel as ChakraFormLabel,
  useFormControlContext as useChakraFormControlContext,
} from "@chakra-ui/form-control";
import {
  Center,
  Flex as ChakraFlex,
  Stack as ChakraStack,
} from "@chakra-ui/layout";
import { useBreakpointValue } from "@chakra-ui/react";
import type { ComponentWithAs } from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import {
  Select as ChakraSelect,
  type Props as ChakraSelectProps,
} from "chakra-react-select";
import { Text } from "@/Components/Foundations/Text";
import type { DropdownThemeStyle } from "@Components/DataDisplay/Dropdown";
import type { InputThemeStyle } from "../Input";
import { defaultInputSize, InputIcon } from "../Input";
import { CaretDown, Warning } from "@phosphor-icons/react";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import type { SizeProp } from "chakra-react-select/dist/types/types";
import { Spinner } from "@Components/Indicators/Spinner";

export interface SelectProps
  extends Omit<
    ChakraSelectProps,
    "size" | "tagVariant" | "chakraStyles" | "variant"
  > {
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

export const Select: ComponentWithAs<"select", SelectProps> = forwardRef<
  SelectProps,
  "select"
>(
  (
    {
      size,
      variant,
      addonLeft,
      addonRight,
      dropdownIndicator,
      loadingIndicator,
      isLoading = false,
      isInvalid,
      isDisabled,
      placeholder,
      overrideStyles,
      isRequired,
      showRequired = true,
      label,
      value,
      id,
      ...props
    }: SelectProps,
    ref
  ) => {
    const defaultSize = useBreakpointValue(defaultInputSize);
    const inputSize = size || defaultSize;
    const formControl = useChakraFormControlContext() || {};
    const invalid = isInvalid ?? formControl.isInvalid;
    const inputStyles = useChakraMultiStyleConfig("Input", {
      size: inputSize,
      variant,
      addonLeft,
      addonRight,
      isInvalid: invalid,
      isDisabled,
      hasLabel: Boolean(label),
    }) as InputThemeStyle;

    const dropdownStyles = useChakraMultiStyleConfig("Dropdown", {
      hasMaxHeight: true,
    }) as DropdownThemeStyle;
    const optionActiveStyle = (
      useChakraMultiStyleConfig("Dropdown", {
        isActive: true,
        hasMaxHeight: true,
      }) as DropdownThemeStyle
    ).itemContainer;

    const chakraStyles = getChakraStyles({
      dropdownStyles,
      inputStyles,
      overrideStyles,
      optionActiveStyle,
    });

    return (
      <ChakraFormLabel
        sx={inputStyles.labelContainer}
        htmlFor={id}
        flex={1}
        position="relative"
      >
        {label && (
          <Text as="span" id="label" display="flex" sx={inputStyles.label}>
            {label}
            {showRequired && isRequired && "*"}
          </Text>
        )}
        <ChakraSelect
          ref={ref}
          isInvalid={invalid}
          isDisabled={isDisabled}
          id={id}
          components={{
            IndicatorSeparator: null,
            DropdownIndicator: () => (
              <DropdownIndicator
                inputStyles={inputStyles}
                addonRight={addonRight}
                invalid={invalid}
                dropdownIndicator={dropdownIndicator}
                isLoading={isLoading}
                loadingIndicator={loadingIndicator}
              />
            ),
            SelectContainer: ({ children }) => (
              <SelectContainer addonLeft={addonLeft} inputStyles={inputStyles}>
                {children}
              </SelectContainer>
            ),
            MenuList: ({ children }) => (
              <ChakraStack spacing={1} sx={dropdownStyles.container}>
                {children}
              </ChakraStack>
            ),
          }}
          placeholder={placeholder}
          size={inputSize as SizeProp}
          chakraStyles={chakraStyles}
          variant={variant}
          value={value}
          {...props}
        />
      </ChakraFormLabel>
    );
  }
);

const getChakraStyles = ({
  dropdownStyles,
  inputStyles,
  overrideStyles,
  optionActiveStyle,
}: {
  dropdownStyles: DropdownThemeStyle;
  inputStyles: InputThemeStyle;
  overrideStyles: ChakraSelectProps["chakraStyles"];
  optionActiveStyle: DropdownThemeStyle["itemContainer"];
}): ChakraSelectProps["chakraStyles"] => {
  return {
    option: (_, state) => ({
      // option needs to be styled like this, otherwise it doesn't let user select the options
      ...dropdownStyles.itemContainer,
      ...(state.isSelected && optionActiveStyle),
    }),
    inputContainer: (styles) => ({
      ...styles,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    valueContainer: (styles) => ({
      ...styles,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    control: (styles) => ({
      ...styles,
      ...inputStyles.input,
    }),
    menu: (styles) => ({
      ...styles,
      left: 0,
      ...dropdownStyles.wrapper,
    }),
    ...overrideStyles,
  };
};

const DropdownIndicator = ({
  inputStyles,
  addonRight,
  invalid,
  dropdownIndicator,
  isLoading,
  loadingIndicator,
}: {
  inputStyles: InputThemeStyle;
  addonRight: SelectProps["addonRight"];
  invalid: boolean;
  dropdownIndicator: SelectProps["dropdownIndicator"];
  isLoading: boolean;
  loadingIndicator: SelectProps["loadingIndicator"];
}) => {
  const { errorIcon: ThemeErrorIcon } = inputStyles;
  return (
    <ChakraFlex
      pointerEvents="all"
      zIndex="auto"
      // these styles are here to ensure that the addonRight positions correctly by default
      height="full"
      right="0"
      align="center"
      position="absolute"
      sx={inputStyles.addonRight}
    >
      {addonRight}
      {invalid && (
        <ChakraFlex data-testid="select-error-icon">
          {ThemeErrorIcon ? (
            <ThemeErrorIcon />
          ) : (
            <InputIcon icon={<PhosphorIcon as={Warning} variant="error" />} />
          )}
        </ChakraFlex>
      )}
      {isLoading
        ? loadingIndicator || <Spinner />
        : dropdownIndicator || (
            <InputIcon
              icon={<PhosphorIcon as={CaretDown} weight={Weight.Regular} />}
            />
          )}
    </ChakraFlex>
  );
};

const SelectContainer = ({
  addonLeft,
  inputStyles,
  children,
}: {
  addonLeft: SelectProps["addonLeft"];
  inputStyles: InputThemeStyle;
  children: React.ReactNode;
}) => {
  return (
    <ChakraFlex position="relative">
      {addonLeft && (
        <Center
          // these styles are here to ensure that the addonLeft positions correctly by default
          pos="absolute"
          left="0"
          children={addonLeft}
          height="full"
          sx={inputStyles.addonLeft}
        />
      )}
      {children}
    </ChakraFlex>
  );
};
