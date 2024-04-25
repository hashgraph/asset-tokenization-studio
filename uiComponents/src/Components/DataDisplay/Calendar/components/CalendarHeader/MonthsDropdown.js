import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/react";
import { Menu, MenuButton } from "@chakra-ui/menu";
import { CaretDown } from "@phosphor-icons/react";
import { Text } from "@/Components/Foundations/Text";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import { Button } from "@Components/Interaction/Button";
import { useDayPicker, useNavigation } from "react-day-picker";
import { MonthsPanel } from "./MonthsPanel";
import { useCalendarContext } from "../../context";
import _ from "lodash";
export var MonthsDropdown = function () {
    var _a, _b;
    var _c = useCalendarContext(), colorScheme = _c.colorScheme, variant = _c.variant;
    var styles = useChakraMultiStyleConfig("Calendar", {
        colorScheme: colorScheme,
        variant: variant
    });
    var _d = useDayPicker(), locale = _d.locale, formatMonthCaption = _d.formatters.formatMonthCaption;
    var navigation = useNavigation();
    return (React.createElement(Menu, { placement: "bottom", offset: [0, -8] },
        React.createElement(MenuButton, { as: Button, sx: styles.dropdownButton, rightIcon: React.createElement(PhosphorIcon, { as: CaretDown, weight: Weight.Fill, color: "currentColor" }) },
            React.createElement(Text, { sx: styles.headerTitle, "data-testid": "month-title" }, _.capitalize((_b = (_a = formatMonthCaption(navigation.currentMonth, {
                locale: locale
            })) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ""))),
        React.createElement(MonthsPanel, null)));
};
