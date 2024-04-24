import {
  barChartPartsList,
  type BarChartThemeConfiguration,
} from "@Components/Charts/BarChart";

export const ConfigBarChart: BarChartThemeConfiguration = {
  parts: barChartPartsList,
  baseStyle: {
    track: {
      bg: "neutral.100",
      borderRadius: "md",
      "& > div": {
        bg: "blue.500",
        borderRadius: "md",
      },
    },
  },
};
