// SPDX-License-Identifier: Apache-2.0

export const Select = {
  baseStyle: {
    field: {
      bg: "white",
      border: "1px solid",
      borderColor: "neutral.300",
      borderRadius: "md",
      _hover: {
        borderColor: "neutral.400",
      },
      _focus: {
        borderColor: "primary.500",
        boxShadow: "0 0 0 1px var(--chakra-colors-primary-500)",
      },
    },
  },
  variants: {
    outline: {
      field: {
        bg: "white",
        border: "1px solid",
        borderColor: "neutral.300",
        borderRadius: "md",
        _hover: {
          borderColor: "neutral.400",
        },
        _focus: {
          borderColor: "primary.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-primary-500)",
        },
      },
    },
  },
  defaultProps: {
    variant: "outline",
  },
};
