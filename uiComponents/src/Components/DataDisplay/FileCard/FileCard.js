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
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { IconButton } from "@Components/Interaction/IconButton";
import { Tooltip } from "@Components/Overlay/Tooltip";
import { Box as ChakraBox, VStack as ChakraVStack, Flex as ChakraFlex, useStyleConfig, Skeleton, } from "@chakra-ui/react";
import { X } from "@phosphor-icons/react";
import React, { useEffect, useRef, useState } from "react";
import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import _merge from "lodash/merge";
import { formatBytes } from "@Components/Forms/FileInput";
export var fileCardPartsList = ["container", "name", "size", "closeIcon"];
export var FileCard = function (_a) {
    var file = _a.file, isInvalid = _a.isInvalid, isLoading = _a.isLoading, _b = _a.errorMsg, errorMsg = _b === void 0 ? "Error uploading the file, please try again." : _b, onRemove = _a.onRemove, sx = _a.sx, props = __rest(_a, ["file", "isInvalid", "isLoading", "errorMsg", "onRemove", "sx"]);
    var formControl = useChakraFormControlContext() || {};
    var invalid = isInvalid !== null && isInvalid !== void 0 ? isInvalid : formControl.isInvalid;
    var themeStyles = useStyleConfig("FileCard", {
        isInvalid: invalid
    });
    var styles = React.useMemo(function () { return _merge(themeStyles, sx); }, [themeStyles, sx]);
    var name = file.name, size = file.size;
    var textRef = useRef(null);
    var _c = useState(false), isOverflowed = _c[0], setIsOverflowed = _c[1];
    useEffect(function () {
        if (textRef.current) {
            setIsOverflowed(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
    }, []);
    var handleClickCloseButton = function (event) {
        event.preventDefault();
        onRemove && onRemove();
    };
    if (isLoading) {
        return React.createElement(Skeleton, { flex: 1, h: "90px" });
    }
    return (React.createElement(ChakraBox, __assign({ sx: styles.container }, props),
        React.createElement(ChakraVStack, { spacing: 5, justifyContent: "flex-start", alignItems: "flex-start" },
            React.createElement(Tooltip, { label: name, isDisabled: !isOverflowed },
                React.createElement(Text, { "data-testid": "text-filename", ref: textRef, sx: styles.name }, name)),
            React.createElement(ChakraFlex, { w: "full", justify: "space-between" },
                React.createElement(Text, { "data-testid": "text-size", sx: styles.size }, isInvalid ? errorMsg : formatBytes(size) + " · Upload completed"),
                !isInvalid && React.createElement(Text, { sx: styles.size }, "100%"))),
        React.createElement(ChakraBox, { position: "absolute", top: 3, right: 4 },
            React.createElement(IconButton, { "data-testid": "button-remove", icon: React.createElement(PhosphorIcon, { as: X }), sx: styles.closeIcon, "aria-label": "Close card", size: "xxs", variant: "tertiary", onClick: handleClickCloseButton }))));
};
