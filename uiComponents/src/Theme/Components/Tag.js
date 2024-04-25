import { tagPartsList } from "@/Components/DataDisplay/Tag";
import { focusVisible } from "@/Theme/utils";
var neutralColor = "neutral";
var bgDisabled = "".concat(neutralColor, ".100");
var bgEnabled = "".concat(neutralColor, ".300");
var colorDisabled = "".concat(neutralColor, ".400");
var colorEnabled = "".concat(neutralColor, ".800");
export var ConfigTag = {
    parts: tagPartsList,
    baseStyle: function (_a) {
        var disabled = _a.disabled;
        return ({
            label: {
                apply: "textStyles.ElementsMediumSM",
                color: disabled ? colorDisabled : colorEnabled
            },
            container: {
                transition: "all 0.2s",
                display: "inline-flex",
                width: "max-content",
                alignItems: "center",
                justifyContent: "center",
                minW: "48px",
                padding: "4px 16px",
                bg: disabled ? bgDisabled : bgEnabled,
                svg: {
                    color: disabled ? colorDisabled : colorEnabled
                },
                _disabled: {
                    color: colorDisabled,
                    bg: bgDisabled
                },
                borderRadius: "full",
                gap: "0.25rem",
                _hover: {
                    bg: disabled ? bgDisabled : "".concat(neutralColor, ".400"),
                    cursor: disabled ? "not-allowed" : "pointer"
                },
                _focusVisible: focusVisible
            }
        });
    },
    sizes: {
        sm: {
            container: { height: 6 }
        },
        lg: {
            container: {
                height: "34px"
            }
        }
    },
    defaultProps: {
        size: "lg"
    }
};
