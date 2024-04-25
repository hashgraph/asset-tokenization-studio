import { circularSliderPartsList } from "@/Components/Charts/CircularSlider";
export var ConfigCircularSlider = {
    parts: circularSliderPartsList,
    baseStyle: {
        label: {
            fontSize: "sm"
        },
        track: {
            "& svg": {
                w: "unset",
                h: "unset"
            }
        }
    },
    sizes: {
        sm: {
            track: {
                w: 20,
                h: 20
            }
        },
        md: {
            track: {
                w: "7.5rem",
                h: "7.5rem"
            }
        }
    },
    defaultProps: {
        size: "sm",
        colorScheme: "blue"
    }
};
