import {
  DefinitionListThemeConfiguration,
  definitionListPartsList,
} from "@hashgraph/securitytoken-uicomponents/DataDisplay";
import { BasePlatformTheme } from "@hashgraph/securitytoken-uicomponents/Theme";

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
