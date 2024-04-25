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
import React from "react";
import { Flex, SkeletonText, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/react";
import { ArrowLeft } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { IconButton } from "@Components/Interaction/IconButton";
export var pageTitlePartsList = ["backButton", "textTitle", "container"];
export var PageTitle = function (_a) {
    var title = _a.title, onGoBack = _a.onGoBack, backButtonProps = _a.backButtonProps, titleProps = _a.titleProps, isLoading = _a.isLoading;
    var styles = useChakraMultiStyleConfig("PageTitle");
    return (React.createElement(Flex, { sx: styles.container },
        onGoBack && (React.createElement(IconButton, __assign({ sx: styles.backButton, icon: React.createElement(PhosphorIcon, { as: ArrowLeft, size: "xxs" }), "aria-label": "Go back", onClick: onGoBack, variant: "secondary", size: "md" }, backButtonProps))),
        isLoading ? (React.createElement(SkeletonText, { skeletonHeight: 6, noOfLines: 1, minWidth: 25 })) : (React.createElement(Text, __assign({ sx: styles.textTitle }, titleProps), title))));
};
