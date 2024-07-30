import {
  DefinitionListThemeConfiguration,
  definitionListPartsList,
} from "@hashgraph/asset-tokenization-uicomponents/DataDisplay";
import { BasePlatformTheme } from "@hashgraph/asset-tokenization-uicomponents/Theme";

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
