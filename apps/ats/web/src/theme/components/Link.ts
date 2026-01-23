// SPDX-License-Identifier: Apache-2.0

// @ts-ignore FIX No se encuentra el módulo "@Components/Interaction/Link" ni sus declaraciones de tipos correspondientes.
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
