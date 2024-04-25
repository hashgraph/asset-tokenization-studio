import { barChartPartsList, } from "@Components/Charts/BarChart";
export var ConfigBarChart = {
    parts: barChartPartsList,
    baseStyle: {
        track: {
            bg: "neutral.100",
            borderRadius: "md",
            "& > div": {
                bg: "blue.500",
                borderRadius: "md"
            }
        }
    }
};
