var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { textStyles } from "@/Theme/textStyles";
import { radioPartsList } from "@Components/Forms/Radio";
export var ConfigRadio = {
    parts: radioPartsList,
    baseStyle: {
        control: {
            borderColor: "neutral.300",
            borderWidth: "1px",
            w: 4,
            h: 4,
            _before: {
                content: "\"\"",
                position: "absolute",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "transparent",
                zIndex: -1,
                filter: "blur(0.5px)"
            },
            _after: {
                content: "\"\"",
                width: "10px",
                position: "absolute",
                height: "10px",
                borderRadius: "50%",
                background: "transparent"
            },
            _hover: {
                borderColor: "neutral.500"
            },
            _focus: {
                bg: "neutral.200",
                borderColor: "neutral.500",
                _before: {
                    background: "neutral.200"
                },
                _checked: {
                    bg: "transparent",
                    borderColor: "primary.700",
                    _before: {
                        bg: "primary.100",
                        position: "absolute",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%"
                    },
                    _after: {
                        bg: "primary.700"
                    }
                }
            },
            _disabled: {
                bg: "neutral.50",
                borderColor: "neutral.200",
                _hover: {
                    borderColor: "neutral.200"
                }
            },
            _checked: {
                bg: "transparent",
                borderColor: "primary.500",
                _hover: {
                    bg: "transparent",
                    borderColor: "primary.700",
                    _after: {
                        bg: "primary.700"
                    }
                },
                _after: {
                    bg: "primary.500"
                }
            },
            _invalid: {
                borderColor: "error",
                _focus: {
                    bg: "error.100",
                    borderColor: "error",
                    _before: {
                        bg: "error.100"
                    }
                },
                _checked: {
                    _after: {
                        bg: "error"
                    }
                }
            }
        },
        container: {
            _hover: {
                ".chakra-radio__control": {
                    borderColor: "neutral.500"
                }
            },
            _checked: {
                _hover: {
                    ".chakra-radio__control": {
                        borderColor: "primary.700",
                        _after: {
                            bg: "primary.700"
                        },
                        _focus: {
                            bg: "transparent",
                            _before: {
                                bg: "primary.100"
                            }
                        }
                    }
                },
                _focus: {}
            }
        },
        label: {
            color: "neutral.700",
            ml: 2,
            _disabled: {
                color: "neutral.300",
                opacity: 1
            }
        }
    },
    sizes: {
        md: {
            control: {
                w: 4,
                h: 4
            },
            label: __assign({}, textStyles.ElementsRegularXS)
        }
    },
    variants: {},
    defaultProps: {
        size: "md"
    }
};
