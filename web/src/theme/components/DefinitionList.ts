import {
  DefinitionListThemeConfiguration,
  definitionListPartsList,
} from "@iob/io-bricks-ui/DataDisplay";
import { BasePlatformTheme } from "@iob/io-bricks-ui/Theme";

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
