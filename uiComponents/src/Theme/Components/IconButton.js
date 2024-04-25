import { buttonVariants } from "../utils/buttonUtils";
export var ConfigIconButton = {
    baseStyle: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "semibold",
        bgColor: "neutral.100",
        fontSize: "14px",
        lineHeight: 5,
        color: "neutral.700",
        minH: "unset",
        h: "unset",
        borderRadius: 8,
        minW: "unset",
        _hover: {
            bgColor: "inherit",
            _disabled: {
                background: "inherit"
            }
        },
        _active: {
            bgColor: "neutral.300"
        },
        _focusVisible: {
            boxShadow: "none"
        },
        _disabled: {
            bgColor: "neutral.100",
            color: "neutral.400"
        },
        _loading: {
            span: {
                lineHeight: 0
            }
        }
    },
    sizes: {
        xs: {
            p: 1
        },
        sm: {
            p: 2
        },
        md: {
            p: 3
        }
    },
    variants: {
        primary: buttonVariants === null || buttonVariants === void 0 ? void 0 : buttonVariants.primary,
        secondary: buttonVariants === null || buttonVariants === void 0 ? void 0 : buttonVariants.secondary,
        tertiary: buttonVariants === null || buttonVariants === void 0 ? void 0 : buttonVariants.tertiary
    },
    defaultProps: {
        size: "md"
    }
};
