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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Avatar as ChakraAvatar, AvatarBadge as ChakraAvatarBadge, } from "@chakra-ui/avatar";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import { SkeletonCircle as ChakraSkeletonCircle } from "@chakra-ui/react";
import { User } from "@phosphor-icons/react";
import React from "react";
import { PhosphorIcon, Weight } from "../../Foundations/PhosphorIcon";
export var avatarPartsList = [
    "container",
    "badge",
    "label",
    "group",
    "excessLabel",
];
export var Avatar = forwardRef(function (_a, ref) {
    var _b = _a.showBadge, showBadge = _b === void 0 ? false : _b, badgeColor = _a.badgeColor, size = _a.size, name = _a.name, src = _a.src, variant = _a.variant, isLoading = _a.isLoading, props = __rest(_a, ["showBadge", "badgeColor", "size", "name", "src", "variant", "isLoading"]);
    var styles = useChakraMultiStyleConfig("Avatar", {
        name: name && !src,
        size: size,
        badgeColor: badgeColor,
        variant: variant
    });
    if (isLoading) {
        return (React.createElement(ChakraSkeletonCircle, __assign({ sx: styles.container, size: size }, props)));
    }
    return (React.createElement(ChakraAvatar, __assign({ ref: ref, name: name, src: src, sx: styles.container, variant: variant, icon: React.createElement(PhosphorIcon, { weight: Weight.Regular, size: "sm", as: User }) }, props), showBadge && React.createElement(ChakraAvatarBadge, { sx: styles.badge })));
});
