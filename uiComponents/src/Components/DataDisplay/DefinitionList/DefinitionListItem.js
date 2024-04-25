import React from "react";
import { Box, Text, SkeletonText } from "@chakra-ui/react";
import { ClipboardButton } from "@/Components/Interaction/ClipboardButton";
import { HoverableContent } from "@/Components/Interaction/HoverableContent";
export var DefinitionListItem = function (_a) {
    var description = _a.description, title = _a.title, canCopy = _a.canCopy, listItemStyles = _a.listItemStyles, listItemTitleStyles = _a.listItemTitleStyles, listItemDescriptionStyles = _a.listItemDescriptionStyles, _b = _a.valueToCopy, valueToCopy = _b === void 0 ? description.toString() : _b, isLoading = _a.isLoading;
    return (React.createElement(HoverableContent, { "data-testid": "definition-list-item-".concat(title), sx: listItemStyles, hiddenContent: !isLoading && canCopy && React.createElement(ClipboardButton, { value: valueToCopy }) },
        React.createElement(Text, { sx: listItemTitleStyles }, title),
        isLoading ? (React.createElement(SkeletonText, { skeletonHeight: 2, flex: 1, noOfLines: 1 })) : (React.createElement(React.Fragment, null, React.isValidElement(description) ? (React.createElement(Box, { sx: listItemDescriptionStyles }, description)) : (React.createElement(Text, { sx: listItemDescriptionStyles }, description))))));
};
