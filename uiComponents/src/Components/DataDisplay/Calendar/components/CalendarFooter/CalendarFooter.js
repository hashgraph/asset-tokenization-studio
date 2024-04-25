import React from "react";
import { Clock } from "@phosphor-icons/react";
import { useDayPicker } from "react-day-picker";
import { Divider, Flex, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/react";
import { useCalendarContext } from "../../context";
import { Input } from "@Components/Forms/Input";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { getZone, parseTimeInputValue } from "../../helpers";
export var CalendarFooter = function () {
    var _a;
    var _b = useCalendarContext(), variant = _b.variant, colorScheme = _b.colorScheme, isDisabled = _b.isDisabled, onChange = _b.onChange, timeInputValue = _b.timeInputValue, setTimeInputValue = _b.setTimeInputValue;
    var selected = useDayPicker().selected;
    var styles = useChakraMultiStyleConfig("Calendar", {
        colorScheme: colorScheme,
        isDisabled: isDisabled,
        variant: variant
    });
    var handleChange = function (evt) {
        var newValue = evt.target.value;
        setTimeInputValue(newValue);
        if (newValue) {
            var date = parseTimeInputValue(newValue, selected);
            if (!date)
                return;
            onChange && onChange(date);
        }
    };
    var disabledInput = selected === undefined || isDisabled;
    return (React.createElement("tfoot", null,
        React.createElement("tr", null,
            React.createElement("td", { colSpan: 7 },
                React.createElement(Divider, { orientation: "horizontal", mt: 4 }),
                React.createElement(Flex, { sx: styles.footer },
                    React.createElement(Flex, null,
                        React.createElement(Input, { "data-testid": "time-input", addonLeft: React.createElement(PhosphorIcon, { as: Clock, weight: Weight.Regular, size: "lg", sx: {
                                    color: (_a = styles.footer) === null || _a === void 0 ? void 0 : _a.color
                                } }), size: "md", sx: styles.timeInput, step: 1, value: timeInputValue, type: "time", disabled: disabledInput, onChange: handleChange })),
                    React.createElement(Text, null, getZone()))))));
};
