import {
  DefinitionListThemeConfiguration,
  definitionListPartsList,
} from "@hashgraph/assettokenization-uicomponents/DataDisplay";
import { BasePlatformTheme } from "@hashgraph/assettokenization-uicomponents/Theme";

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
