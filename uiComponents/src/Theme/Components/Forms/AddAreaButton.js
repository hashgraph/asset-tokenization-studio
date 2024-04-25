export var ConfigAddAreaButton = {
    baseStyle: {
        minWidth: "200px",
        py: 4,
        justifyContent: "center",
        alignItems: "center",
        apply: "textStyles.ElementsRegularXS",
        borderRadius: 4,
        border: "1px",
        borderStyle: "dashed",
        borderColor: "neutral.400",
        bg: "neutral.25",
        w: "full",
        h: "56px",
        color: "neutral.800",
        svg: {
            color: "neutral.800"
        },
        _disabled: {
            opacity: 1,
            color: "neutral.500",
            borderColor: "neutral.300",
            svg: {
                color: "neutral.500"
            }
        },
        _hover: {
            bg: "neutral.neutral",
            borderColor: "neutral.500"
        },
        _focus: {
            bg: "neutral.neutral",
            boxShadow: "0 0 3px 3px #C8CDF7"
        },
        _active: {
            bg: "neutral.neutral"
        }
    }
};
