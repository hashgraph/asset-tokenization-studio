import React from "react";
import { Flex, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { IconButton } from "@Components/Interaction/IconButton";
import { useNavigation } from "react-day-picker";
import { MonthsDropdown } from "./MonthsDropdown";
import { useCalendarContext } from "../../context";
import { YearsDropdown } from "./YearsDropdown";
export var CalendarHeader = function () {
    var navigation = useNavigation();
    var _a = useCalendarContext(), variant = _a.variant, colorScheme = _a.colorScheme;
    var styles = useChakraMultiStyleConfig("Calendar", {
        colorScheme: colorScheme,
        variant: variant
    });
    return (React.createElement(Flex, { sx: styles.header },
        React.createElement(IconButton, { icon: React.createElement(PhosphorIcon, { as: CaretLeft }), "data-testid": "previous-month-btn", "aria-label": "Go previous", onClick: function () {
                if (navigation.previousMonth) {
                    navigation.goToDate(navigation.previousMonth);
                }
            }, sx: styles.changeMonthButton }),
        React.createElement(Flex, { alignItems: "center", padding: "0.5rem" },
            React.createElement(MonthsDropdown, null),
            React.createElement(YearsDropdown, null)),
        React.createElement(IconButton, { "data-testid": "next-month-btn", icon: React.createElement(PhosphorIcon, { as: CaretRight }), "aria-label": "Go previous", onClick: function () {
                if (navigation.nextMonth) {
                    navigation.goToDate(navigation.nextMonth);
                }
            }, sx: styles.changeMonthButton })));
};
