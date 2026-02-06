// SPDX-License-Identifier: Apache-2.0

import type { LinkThemeConfiguration } from "@Components/Interaction/Link";

export const Link: LinkThemeConfiguration = {
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
