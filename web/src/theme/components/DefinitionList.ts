import {
  DefinitionListThemeConfiguration,
  definitionListPartsList,
} from "@hashgraph/uiComponents/DataDisplay";
import { BasePlatformTheme } from "@hashgraph/uiComponents/Theme";

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
