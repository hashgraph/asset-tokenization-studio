import { avatarPartsList, } from "../../Components/Basic/Avatar/Avatar";
var baseStyle = function (_a) {
    var name = _a.name, badgeColor = _a.badgeColor;
    return ({
        container: {
            bg: "neutral",
            fontWeight: "medium",
            svg: {
                color: "neutral.400"
            }
        },
        badge: {
            border: "none",
            transform: name ? "translate(0%, 0%)" : "translate(25%, 0%)",
            boxShadow: "0 0 0 0.15em var(--chakra-colors-neutral)",
            bg: badgeColor ? badgeColor : "green.500"
        }
    });
};
var sizes = {
    md: function (_a) {
        var name = _a.name;
        return ({
            container: {
                width: 8,
                height: 8
            },
            badge: {
                boxSize: name ? 2 : 3.5
            }
        });
    }
};
export var ConfigAvatar = {
    parts: avatarPartsList,
    baseStyle: baseStyle,
    sizes: sizes,
    variants: {
        light: function () { return ({
            container: {
                color: "black"
            }
        }); },
        dark: function () { return ({
            container: {
                color: "neutral"
            }
        }); }
    },
    defaultProps: {
        size: "md",
        variant: "light"
    }
};
