import type { CheckboxThemeConfiguration } from "@Components/Forms/Checkbox";
import { checkboxPartsList } from "@Components/Forms/Checkbox";
import React from "react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Check } from "@phosphor-icons/react";
import { textStyles } from "@/Theme/textStyles";

const Icon = ({ isChecked }: { isChecked?: boolean }) => {
  return isChecked ? (
    <PhosphorIcon as={Check} sx={{ color: "inherit" }} />
  ) : (
    <></>
  );
};

export const ConfigCheckbox: CheckboxThemeConfiguration = {
  parts: checkboxPartsList,
  baseStyle: {
    control: {
      borderColor: "neutral.300",
      borderWidth: "1px",
      transition: "all .2s ease-in",
      _hover: {
        borderColor: "neutral.500",
      },
      _focus: {
        bg: "neutral.200",
        boxShadow: "var(--chakra-colors-neutral-100) 0px 0px 1px 2px",
        borderColor: "neutral.500",
      },
      _checked: {
        bg: "primary.500",
        borderColor: "primary.500",
        _hover: {
          borderColor: "primary.700",
          bg: "primary.700",
        },
        _disabled: {
          bg: "neutral.200",
          borderColor: "neutral.200",
          color: "neutral",
        },
        _focus: {
          bg: "primary.700",
          boxShadow: "var(--chakra-colors-primary-100) 0px 0px 1px 2px",
          borderColor: "primary.700",
        },
      },
      _disabled: {
        bg: "neutral.50",
        borderColor: "neutral.200",
        color: "neutral",
      },
      _invalid: {
        borderColor: "error",
        _focus: {
          borderColor: "error",
          bg: "error.100",
          boxShadow: "var(--chakra-colors-error-100) 0px 0px 1px 2px",
        },
      },
    },
    iconCustom: Icon,
    label: {
      color: "neutral.700",
      ml: 2,
      _disabled: {
        color: "neutral.300",
        opacity: 1,
      },
    },
  },
  sizes: {
    md: {
      control: {
        w: 4,
        h: 4,
      },
      label: {
        // @ts-ignore
        ...textStyles.ElementsRegularXS,
      },
    },
  },
  variants: {
    square: {
      control: {
        borderRadius: "2px",
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "square",
  },
};
