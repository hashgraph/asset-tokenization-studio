import {
  InputIcon,
  inputPartsList,
  type InputConfigProps,
  type InputThemeConfiguration,
} from "@Components/Forms/Input";
import React from "react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";

const baseStyle: InputThemeConfiguration["baseStyle"] = ({
  addonLeft,
  addonRight,
  isSuccess,
  isInvalid,
  isClearable,
  hasSubLabel,
}: InputConfigProps) => {
  const hasPaddingEnd = addonRight || isSuccess || isInvalid || isClearable;
  const totalSpaces =
    [addonRight, isSuccess, isInvalid, isClearable].filter((item) => item)
      .length * 10;

  return {
    labelContainer: {
      width: "100%",
      position: "relative",
    },
    input: {
      paddingStart: addonLeft ? 10 : 3,
      paddingEnd: hasPaddingEnd ? totalSpaces : 3,
      position: "relative",
      apply: "textStyles.ElementsRegularSM",
      color: "neutral.800",
      textOverflow: "ellipsis",
      _placeholder: {
        apply: "textStyles.ElementsRegularSM",
        color: "neutral.400",
      },
    },
    label: {
      apply: "textStyles.ElementsRegularSM",
      color: "neutral.700",
      zIndex: 1,
      mb: hasSubLabel ? 7 : 2,
    },
    subLabel: {
      apply: "textStyles.ElementsRegularXS",
      color: "neutral.500",
      zIndex: 1,
      mb: 2,
    },
    addonLeft: {
      ml: 3,
      height: "full",
    },
    addonRight: { color: "neutral.500", mr: 3, gap: 1 },
    topDescription: {
      position: "absolute",
      top: 0,
      right: 0,
      apply: "textStyles.BodyRegularXS",
    },
    bottomDescription: {
      mt: 2,
      apply: "textStyles.BodyRegularXS",
    },
    errorIcon: () => (
      <InputIcon icon={<PhosphorIcon as={WarningCircle} variant="error" />} />
    ),
    validIcon: () => (
      <InputIcon icon={<PhosphorIcon as={CheckCircle} variant="success" />} />
    ),
  };
};

const sizesStyles = {
  sm: {
    input: {
      minH: 8,
      paddingY: "5px",
    },
  },
  md: {
    input: {
      minH: 10,
      paddingY: "9px",
    },
  },
  lg: {
    input: {
      minH: 12,
      paddingY: "13px",
    },
  },
};

const outline = ({ isSuccess, isInvalid }: InputConfigProps) => {
  return {
    input: {
      border: "1px solid",
      borderColor: isSuccess ? "success" : "neutral.300",
      borderRadius: "simple",
      _hover: {
        borderColor: "neutral.500",
      },
      _focus: {
        borderColor: isSuccess ? "success" : "primary",
        _hover: { borderColor: isSuccess ? "success" : "primary" },
      },
      _active: {
        borderColor: isSuccess ? "success" : "primary",
        _hover: { borderColor: isSuccess ? "success" : "primary" },
      },
      _invalid: {
        borderColor: "error",
        _focus: {
          borderColor: "error",
          boxShadow: "none",
        },
        _active: {
          borderColor: "error",
          boxShadow: "none",
        },
      },
      ...(isInvalid && {
        // this has to be added as well for selects
        borderColor: "error",
        _focus: {
          borderColor: "error",
          boxShadow: "none",
        },
        _active: {
          borderColor: "error",
          boxShadow: "none",
        },
      }),
      _disabled: {
        borderColor: "neutral.100",
        bg: "neutral.50",
        color: "neutral.300",
      },
    },
  };
};

export const ConfigInput: InputThemeConfiguration = {
  parts: inputPartsList,
  baseStyle,
  sizes: {
    sm: sizesStyles.sm,
    md: sizesStyles.md,
    lg: sizesStyles.lg,
  },
  variants: {
    outline,
  },
  defaultProps: {
    variant: "outline",
  },
};
