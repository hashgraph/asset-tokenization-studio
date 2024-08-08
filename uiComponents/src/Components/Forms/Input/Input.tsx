import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import type { InputProps as ChakraInputProps } from "@chakra-ui/input";
import {
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputLeftElement as ChakraInputLeftElement,
  InputRightElement as ChakraInputRightElement,
} from "@chakra-ui/input";
import type {
  SystemStyleObject as ChakraSystemStyleObject,
  ComponentWithAs,
} from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import React from "react";
import _merge from "lodash/merge";
import { Text } from "../../Foundations/Text";

import {
  Box as ChakraBox,
  Center,
  Flex as ChakraFlex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import { CheckCircle, Warning, X } from "@phosphor-icons/react";
import type { IconButtonProps } from "@Components/Interaction/IconButton";
import { IconButton } from "@Components/Interaction/IconButton";
import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@/Theme/Components/BaseMultiStyleConfiguration";

export const inputPartsList: Array<
  | "labelContainer"
  | "label"
  | "subLabel"
  | "addonLeft"
  | "addonRight"
  | "input"
  | "container"
  | "errorIcon"
  | "topDescription"
  | "bottomDescription"
> = [
  "container",
  "addonLeft",
  "addonRight",
  "labelContainer",
  "label",
  "subLabel",
  "input",
  "errorIcon",
  "topDescription",
  "bottomDescription",
];

type Parts = typeof inputPartsList;

export type InputConfigProps = {
  size: string;
  variant: ChakraInputProps["variant"];
  addonLeft?: React.ReactNode;
  addonRight?: React.ReactNode;
  isInvalid?: boolean;
  isSuccess?: boolean;
  isDisabled?: boolean;
  hasLabel?: boolean;
  hasSubLabel?: boolean;
  isClearable?: boolean;
  onClear?: React.MouseEventHandler<HTMLButtonElement>;
  bottomDescription?: string | React.ReactElement;
  topDescription?: string | React.ReactElement;
};
export interface InputThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (({
        addonLeft,
        variant,
        isInvalid,
        isDisabled,
        hasSubLabel,
      }: InputConfigProps) => Partial<InputThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

export interface InputProps extends ChakraInputProps {
  addonLeft?: React.ReactElement;
  addonRight?: React.ReactElement;
  size?: string;
  label?: string | React.ReactElement;
  subLabel?: string | React.ReactElement;
  showRequired?: boolean;
  isSuccess?: boolean;
  isClearable?: boolean;
  onClear?: React.MouseEventHandler<HTMLButtonElement>;
  bottomDescription?: string | React.ReactElement;
  topDescription?: string | React.ReactElement;
}

export interface InputIconButtonProps extends IconButtonProps {
  children?: React.ReactElement;
  icon: React.ReactElement;
}

export type InputThemeStyle = Record<Parts[number], ChakraSystemStyleObject> & {
  errorIcon: React.FunctionComponent;
  validIcon: React.FunctionComponent;
  clearIconButton: React.FunctionComponent;
};

export const defaultInputSize = { base: "lg", lg: "md" };
export const Input: ComponentWithAs<"input", InputProps> = forwardRef<
  InputProps,
  "input"
>(
  (
    {
      size,
      variant,
      id,
      addonLeft: AddonLeft,
      addonRight: AddonRight,
      isInvalid,
      isDisabled,
      isRequired,
      label,
      subLabel,
      placeholder = " ",
      showRequired = true,
      isSuccess,
      isClearable,
      onClear,
      bottomDescription,
      topDescription,
      sx,
      ...props
    }: InputProps,
    ref
  ) => {
    const formControl = useChakraFormControlContext() || {};
    const invalid = isInvalid ?? formControl.isInvalid;

    const defaultSize = useBreakpointValue(defaultInputSize);
    const inputSize = size || defaultSize;

    const {
      errorIcon: ThemeErrorIcon = () => (
        <InputIcon icon={<PhosphorIcon as={Warning} variant="error" />} />
      ),
      validIcon: ThemeValidIcon = () => (
        <InputIcon icon={<PhosphorIcon as={CheckCircle} />} />
      ),
      clearIconButton: ThemeClearIcon = () => (
        <InputIconButton
          aria-label="Clear"
          onMouseDown={onClear}
          icon={<PhosphorIcon as={X} weight={Weight.Bold} />}
        />
      ),
      ...styles
    } = useChakraMultiStyleConfig("Input", {
      size: inputSize,
      variant,
      addonLeft: AddonLeft,
      addonRight: AddonRight,
      isInvalid: invalid,
      isSuccess,
      isDisabled,
      hasLabel: Boolean(label),
      isClearable,
      onClear,
    }) as InputThemeStyle;

    const inputStyle = React.useMemo<ChakraSystemStyleObject>(
      () => _merge(styles.input, sx),
      [styles.input, sx]
    );

    return (
      <ChakraBox
        as="label"
        sx={styles.labelContainer}
        htmlFor={id}
        flex={1}
        position="relative"
        ref={ref}
      >
        {label &&
          (React.isValidElement(label) ? (
            <ChakraBox sx={styles.label}>{label}</ChakraBox>
          ) : (
            <Text as="span" id="label" display="flex" sx={styles.label}>
              {label}
              {showRequired && isRequired && "*"}
            </Text>
          ))}
        {subLabel &&
          (React.isValidElement(subLabel) ? (
            <ChakraBox sx={styles.subLabel}>{subLabel}</ChakraBox>
          ) : (
            <Text as="span" id="subLabel" display="flex" sx={styles.subLabel}>
              {subLabel}
            </Text>
          ))}
        {topDescription &&
          (React.isValidElement(topDescription) ? (
            <ChakraBox sx={styles.topDescription}>{topDescription}</ChakraBox>
          ) : (
            <Text sx={styles.topDescription}>{topDescription}</Text>
          ))}
        <ChakraInputGroup overflow="hidden" sx={styles.container}>
          {AddonLeft && (
            <ChakraInputLeftElement
              children={AddonLeft}
              height="full"
              sx={styles.addonLeft}
            />
          )}

          <ChakraInput
            size={inputSize}
            variant={variant}
            id={id}
            sx={inputStyle}
            isDisabled={isDisabled}
            isInvalid={invalid}
            placeholder={placeholder}
            {...props}
          />
          {(AddonRight || isInvalid || isSuccess || isClearable) && (
            <ChakraInputRightElement
              pointerEvents="all"
              zIndex="auto"
              height="full"
              sx={styles.addonRight}
            >
              {isClearable && (
                <ChakraFlex data-testid="input-clear-icon-button">
                  <ThemeClearIcon />
                </ChakraFlex>
              )}
              {AddonRight}
              {isInvalid && (
                <ChakraFlex data-testid="input-error-icon">
                  {<ThemeErrorIcon />}
                </ChakraFlex>
              )}
              {isSuccess && (
                <ChakraFlex data-testid="input-success-icon">
                  {<ThemeValidIcon />}
                </ChakraFlex>
              )}
            </ChakraInputRightElement>
          )}
        </ChakraInputGroup>
        {bottomDescription &&
          (React.isValidElement(bottomDescription) ? (
            <ChakraBox sx={styles.bottomDescription}>
              {bottomDescription}
            </ChakraBox>
          ) : (
            <Text sx={styles.bottomDescription}>{bottomDescription}</Text>
          ))}
      </ChakraBox>
    );
  }
);

export const InputIcon = ({ icon }: { icon: React.ReactElement }) => {
  const SizedIcon = React.cloneElement(icon, {
    size: "xxs",
    weight: Weight.Fill,
    sx: { zIndex: 1 },
    ...icon.props,
  });

  return (
    <Center w={6} h={6}>
      {SizedIcon}
    </Center>
  );
};

export const InputIconButton = ({ icon, ...props }: InputIconButtonProps) => {
  const SizedIcon = React.cloneElement(icon, {
    size: "xxs",
    weight: Weight.Fill,
    ...icon.props,
  });

  return (
    <IconButton
      size="xs"
      variant="tertiary"
      sx={{ color: "inherit" }}
      icon={SizedIcon}
      {...props}
    />
  );
};
