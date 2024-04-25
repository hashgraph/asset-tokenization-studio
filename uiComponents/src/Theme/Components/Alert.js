import React from "react";
import { Info, Warning, CheckCircle, WarningCircle, } from "@phosphor-icons/react";
import { alertPartsList } from "@Components/Overlay/Alert/Alert";
import { Spinner } from "@Components/Indicators/Spinner";
import { Weight } from "@/Components/Foundations/PhosphorIcon";
export var iconNames = {
    info: Info,
    success: CheckCircle,
    warning: Warning,
    error: WarningCircle,
    loading: React.createElement(Spinner, null)
};
export var colorSchemes = {
    info: "blue",
    success: "green",
    warning: "orange",
    error: "red",
    loading: "neutral"
};
export var ConfigAlert = {
    parts: alertPartsList,
    baseStyle: function (_a) {
        var status = _a.status;
        return ({
            container: {
                borderRadius: "simple",
                paddingTop: 2,
                paddingBottom: 2,
                minWidth: "308px",
                minHeight: "32px",
                maxWidth: {
                    base: "100%",
                    md: "580px"
                },
                width: {
                    base: "100%",
                    md: "auto"
                }
            },
            contentContainer: {
                alignItems: "flex-start",
                pr: 6
            },
            icon: {
                as: iconNames[status],
                weight: Weight.Fill,
                __css: {
                    color: "neutral.800"
                },
                marginRight: "12px"
            },
            title: {
                apply: "textStyles.ElementsBoldSM",
                color: "neutral.800"
            },
            description: {
                apply: "textStyles.ElementsRegularSM",
                color: "neutral.800",
                flex: 1
            },
            closeBtn: {
                alignSelf: "center",
                color: "neutral.800",
                _hover: {
                    color: "neutral.800"
                },
                _active: {
                    color: "neutral.800"
                }
            }
        });
    },
    variants: {
        subtle: function (_a) {
            var status = _a.status;
            return {
                container: {
                    bg: "".concat(colorSchemes[status], ".50")
                },
                icon: {
                    as: iconNames[status]
                }
            };
        },
        solid: function (_a) {
            var status = _a.status;
            return {
                container: {
                    bg: "".concat(colorSchemes[status], ".50")
                },
                icon: {
                    as: iconNames[status]
                }
            };
        },
        leftAccent: function (_a) {
            var status = _a.status;
            return {
                container: {
                    bg: "".concat(colorSchemes[status], ".50"),
                    borderLeftWidth: "4px",
                    borderLeftColor: "".concat(colorSchemes[status], ".500")
                },
                icon: {
                    color: "".concat(colorSchemes[status], ".500"),
                    as: iconNames[status]
                },
                title: {
                    color: "neutral.700"
                },
                description: {
                    color: "neutral.700"
                },
                closeBtn: {
                    color: "neutral.700"
                }
            };
        },
        topAccent: function (_a) {
            var status = _a.status;
            return {
                container: {
                    bg: "".concat(colorSchemes[status], ".50"),
                    borderTopWidth: "4px",
                    borderTopColor: "".concat(colorSchemes[status], ".500")
                },
                icon: {
                    color: "".concat(colorSchemes[status], ".500"),
                    as: iconNames[status]
                },
                title: {
                    color: "neutral.700"
                },
                description: {
                    color: "neutral.700"
                },
                closeBtn: {
                    color: "neutral.700"
                }
            };
        }
    },
    defaultProps: {}
};
