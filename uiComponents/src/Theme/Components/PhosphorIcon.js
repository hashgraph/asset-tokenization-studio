import { Weight } from "@/Components/Foundations/PhosphorIcon";
export var ConfigPhosphorIcon = {
    baseStyle: {
        color: "neutral.800",
        weight: Weight.Regular
    },
    variants: {
        success: {
            color: "success"
        },
        error: {
            color: "error"
        }
    },
    sizes: {
        xxs: {
            width: 4,
            height: 4
        },
        xs: {
            width: 6,
            height: 6
        },
        sm: {
            width: 8,
            height: 8
        },
        md: {
            width: 12,
            height: 12
        }
    },
    defaultProps: {
        size: "xxs"
    }
};
