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
import _startCase from "lodash/startCase";
var Typography;
(function (Typography) {
    Typography["Body"] = "Body";
    Typography["Heading"] = "Heading";
    Typography["Elements"] = "Elements";
})(Typography || (Typography = {}));
var Variant;
(function (Variant) {
    Variant["Light"] = "light";
    Variant["Regular"] = "regular";
    Variant["Medium"] = "medium";
    Variant["Semibold"] = "semibold";
    Variant["Bold"] = "bold";
})(Variant || (Variant = {}));
var Size;
(function (Size) {
    Size["XS"] = "XS";
    Size["SM"] = "SM";
    Size["MD"] = "MD";
    Size["LG"] = "LG";
    Size["XL"] = "XL";
    Size["2XL"] = "2XL";
})(Size || (Size = {}));
var variantStyles = {
    light: {
        fontFamily: "light",
        fontWeight: "light"
    },
    regular: {
        fontFamily: "regular",
        fontWeight: "normal"
    },
    medium: {
        fontFamily: "medium",
        fontWeight: "medium"
    },
    semibold: {
        fontFamily: "semiBold",
        fontWeight: "semibold"
    },
    bold: {
        fontFamily: "bold",
        fontWeight: "bold"
    }
};
var generateStyles = function (_a) {
    var sizes = _a.sizes, type = _a.type, variants = _a.variants;
    return sizes.reduce(function (prev, curr) {
        var variantsStyles = variants.reduce(function (prev, variant) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a["".concat(type).concat(_startCase(variant)).concat(curr.size)] = __assign(__assign({}, curr.style), variantStyles[variant]), _a)));
        }, {});
        return __assign(__assign({}, prev), variantsStyles);
    }, {});
};
var bodySizes = [
    { size: Size.LG, style: { fontSize: "xl", lineHeight: "3xl" } },
    { size: Size.MD, style: { fontSize: "md", lineHeight: "2xl" } },
    { size: Size.SM, style: { fontSize: "sm", lineHeight: "xl" } },
    {
        size: Size.XS,
        style: { fontSize: "xs", lineHeight: "md" }
    },
];
var elementSizes = [
    { size: Size["2XL"], style: { fontSize: "4xl", lineHeight: "7xl" } },
    { size: Size.XL, style: { fontSize: "2xl", lineHeight: "4xl" } },
    { size: Size.LG, style: { fontSize: "xl", lineHeight: "3xl" } },
    { size: Size.MD, style: { fontSize: "md", lineHeight: "2xl" } },
    { size: Size.SM, style: { fontSize: "sm", lineHeight: "xl" } },
    {
        size: Size.XS,
        style: { fontSize: "xs", lineHeight: "md" }
    },
];
var headingSizes = [
    {
        size: Size.XL,
        style: {
            fontSize: "2xl",
            lineHeight: "4xl"
        }
    },
    {
        size: Size.LG,
        style: {
            fontSize: "xl",
            lineHeight: "3xl"
        }
    },
    {
        size: Size.MD,
        style: {
            fontSize: "md",
            lineHeight: "2xl"
        }
    },
    {
        size: Size.SM,
        style: {
            fontSize: "sm",
            lineHeight: "xl"
        }
    },
    {
        size: Size.XS,
        style: {
            fontSize: "xs",
            lineHeight: "md"
        }
    },
];
export var textStyles = __assign(__assign(__assign({}, generateStyles({
    sizes: bodySizes,
    variants: [Variant.Medium, Variant.Regular, Variant.Bold, Variant.Semibold],
    type: Typography.Body
})), generateStyles({
    sizes: elementSizes,
    variants: [
        Variant.Light,
        Variant.Regular,
        Variant.Medium,
        Variant.Semibold,
        Variant.Bold,
    ],
    type: Typography.Elements
})), generateStyles({
    sizes: headingSizes,
    variants: [Variant.Regular, Variant.Medium, Variant.Semibold, Variant.Bold],
    type: Typography.Heading
}));
