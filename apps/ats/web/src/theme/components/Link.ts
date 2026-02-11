// SPDX-License-Identifier: Apache-2.0

import type { ComponentStyleConfig } from "@chakra-ui/react";

export const Link: ComponentStyleConfig = {
  variants: {
    table: {
      color: "grey.900",
      textDecoration: "none",
      _focus: {
        boxShadow: "none",
      },
    },
  },
  defaultProps: {
    variant: "highlighted",
  },
};
