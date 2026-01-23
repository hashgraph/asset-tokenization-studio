// SPDX-License-Identifier: Apache-2.0

import { DefinitionListThemeConfiguration, definitionListPartsList } from "io-bricks-ui";
import { BasePlatformTheme } from "io-bricks-ui/Theme";

export const DefinitionList: DefinitionListThemeConfiguration = {
  parts: definitionListPartsList,
  baseStyle: {
    listTitle: {
      ...BasePlatformTheme.textStyles.ElementsSemiboldMD,
      color: "inherit",
    },
    container: {
      pb: 8,
      w: "full",
      maxWidth: "unset",
    },
  },
};
