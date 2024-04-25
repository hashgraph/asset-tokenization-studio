/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Flex, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/react";
import { useDayPicker, useNavigation } from "react-day-picker";
import { MenuList } from "@chakra-ui/menu";
import { addYears, subYears, isSameYear, isSameMonth, startOfMonth, isWithinInterval, setYear, setMonth, } from "date-fns";
import { Month } from "./Month";
import _ from "lodash";
import { useCalendarContext } from "../../context";
export var MonthsPanel = function () {
    var _a = useNavigation(), goToMonth = _a.goToMonth, currentMonth = _a.currentMonth;
    var _b = useCalendarContext(), colorScheme = _b.colorScheme, variant = _b.variant, selected = _b.selected;
    var styles = useChakraMultiStyleConfig("Calendar", {
        colorScheme: colorScheme,
        variant: variant
    });
    var _c = useDayPicker(), 
    // From 10 years ago to now (default)
    fromDateProp = _c.fromDate, toDateProp = _c.toDate, locale = _c.locale, formatMonthCaption = _c.formatters.formatMonthCaption;
    var _d = React.useState(selected || currentMonth), selectedYear = _d[0], setSelectedYear = _d[1];
    var toDate = React.useMemo(function () {
        if (!toDateProp)
            return addYears(selectedYear, 1);
        return toDateProp;
    }, [toDateProp, selectedYear]);
    var fromDate = React.useMemo(function () {
        if (!fromDateProp)
            return subYears(selectedYear, 10);
        return fromDateProp;
    }, [fromDateProp, selectedYear]);
    React.useEffect(function () {
        if (!isSameYear(currentMonth, selectedYear)) {
            setSelectedYear(currentMonth);
        }
    }, [currentMonth]);
    var months = React.useMemo(function () {
        if (!fromDate || !toDate)
            return [];
        var dropdownMonths = [];
        if (isSameYear(fromDate, toDate)) {
            // only display the months included in the range
            var date = startOfMonth(fromDate);
            for (var month = fromDate.getMonth(); month <= toDate.getMonth(); month++) {
                dropdownMonths.push(setMonth(date, month));
            }
        }
        else {
            // display all the 12 months
            var date = startOfMonth(selectedYear); // Any date should be OK, as we just need the year
            for (var month = 0; month <= 11; month++) {
                dropdownMonths.push(setMonth(date, month));
            }
        }
        return dropdownMonths;
    }, [fromDate, toDate, selectedYear]);
    var handleChangeMonth = function (date) {
        var newMonthWithCurrentYear = setYear(date, selectedYear.getFullYear());
        goToMonth(newMonthWithCurrentYear);
    };
    var isCurrentMonth = function (month) {
        if (isMonthDisabled(month))
            return false;
        var isCurrentMonth = ![
            isSameMonth(month, currentMonth),
            isSameYear(month, selectedYear),
        ].includes(false);
        return isCurrentMonth;
    };
    var isMonthDisabled = function (month) {
        if (!fromDate || !toDate)
            return false;
        return !isWithinInterval(month, {
            end: toDate,
            start: fromDate
        });
    };
    return (React.createElement(MenuList, { sx: styles.dropdownPanel },
        React.createElement(Flex, { gap: 1, width: "full", height: "100%", alignItems: "flex-start", direction: "column" }, months.map(function (month) {
            var _a;
            return (React.createElement(Month, { key: month.toString(), isDisabled: isMonthDisabled(month), isSelected: isCurrentMonth(month), onClick: function () { return handleChangeMonth(month); }, label: _.capitalize((_a = formatMonthCaption(month, { locale: locale })) === null || _a === void 0 ? void 0 : _a.toString()) }));
        }))));
};
