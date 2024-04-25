import {
  definitionListPartsList,
  type DefinitionListThemeConfiguration,
  type DefinitionStylesProps,
} from "@Components/DataDisplay/DefinitionList";
import { textStyles } from "../textStyles";

export const DefinitionListThemeConfig: DefinitionListThemeConfiguration = {
  parts: definitionListPartsList,
  baseStyle: ({ columns }: DefinitionStylesProps) => ({
    listTitle: {
      // @ts-ignore
      ...textStyles.ElementsSemiboldMD,
    },
    listItem: {
      py: 4,
      px: 2,
      borderBottom: "1px solid",
      borderColor: "neutral.300",
      alignItems: "center",
      width: "full",
    },
    definitionListGrid: {
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "5%",
    },
    listItemTitle: {
      // @ts-ignore
      ...textStyles.ElementsSemiboldSM,
      color: "neutral.900",
      mr: 4,
      alignSelf: "center",
    },
    listItemDescription: {
      // @ts-ignore
      ...textStyles.ElementsRegularSM,
      alignSelf: "center",
      color: "neutral.900",
      mr: 1,
    },
  }),
};
