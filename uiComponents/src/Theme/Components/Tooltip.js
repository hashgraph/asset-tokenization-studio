var _a, _b, _c;
import { cssVar } from "@chakra-ui/styled-system";
var $arrowBg = cssVar("popper-arrow-bg");
var $arrowBorder = cssVar("popper-arrow-shadow-color");
export var ConfigTooltip = {
    baseStyle: (_a = {
            px: 3,
            py: 2,
            apply: "BodyMediumSM",
            borderRadious: "8px",
            borderWidth: "1px",
            borderColor: "var(--chakra-colors-chakra-border-color)"
        },
        _a[$arrowBorder.variable] = "var(--chakra-colors-chakra-border-color)",
        _a),
    variants: {
        dark: (_b = {
                bg: "var(--chakra-colors-black)"
            },
            _b[$arrowBg.variable] = "var(--chakra-colors-black)",
            _b.color = "var(--chakra-colors-neutral)",
            _b),
        light: (_c = {
                bg: "var(--chakra-colors-neutral)"
            },
            _c[$arrowBg.variable] = "var(--chakra-colors-neutral)",
            _c.color = "var(--chakra-colors-black)",
            _c)
    },
    defaultProps: {
        variant: "dark"
    }
};
