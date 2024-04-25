import { buttonVariants, buttonSizes } from "../utils/buttonUtils";
export var ConfigButton = {
    baseStyle: {
        minHeight: 12,
        height: "unset",
        minWidth: 19,
        paddingY: 2,
        paddingX: 4,
        justifyContent: "center",
        alignItems: "center",
        apply: "textStyles.ElementsMediumSM",
        borderRadius: 8,
        transition: "all 0.2s",
        display: "inline-flex",
        color: "neutral.400",
        _disabled: {
            opacity: 1,
            backgroundColor: "neutral.200",
            color: "neutral.400"
        },
        _loading: {
            backgroundColor: "neutral.200",
            position: "relative",
            color: "neutral",
            zIndex: 0,
            _hover: {
                backgroundColor: "neutral.200"
            }
        }
    },
    sizes: buttonSizes,
    variants: buttonVariants,
    defaultProps: {
        size: "lg",
        variant: "primary"
    }
};
