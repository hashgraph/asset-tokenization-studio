/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Grid, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/react";
import { useDayPicker, useNavigation } from "react-day-picker";
import { MenuList } from "@chakra-ui/menu";
import { addYears, subYears, isSameYear, isWithinInterval, startOfYear, setYear, } from "date-fns";
import _ from "lodash";
import { useCalendarContext } from "../../context";
import { Year } from "./Year";
export var YearsPanel = function () {
    var _a = useNavigation(), goToMonth = _a.goToMonth, currentMonth = _a.currentMonth;
    var _b = useCalendarContext(), colorScheme = _b.colorScheme, variant = _b.variant, selected = _b.selected;
    var styles = useChakraMultiStyleConfig("Calendar", {
        colorScheme: colorScheme,
        variant: variant
    });
    var _c = useDayPicker(), 
    // From 10 years ago to now (default)
    fromDateProp = _c.fromDate, toDateProp = _c.toDate, locale = _c.locale, formatYearCaption = _c.formatters.formatYearCaption;
    var _d = React.useState(selected), selectedYear = _d[0], setSelectedYear = _d[1];
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
    var years = React.useMemo(function () {
        if (!fromDate || !toDate)
            return [];
        var years = [];
        var fromYear = fromDate.getFullYear();
        var toYear = toDate.getFullYear();
        for (var year = fromYear; year <= toYear; year++) {
            years.push(setYear(startOfYear(new Date()), year));
        }
        return years;
    }, [fromDate, toDate]);
    React.useEffect(function () {
        if (!isSameYear(currentMonth, selectedYear)) {
            setSelectedYear(currentMonth);
        }
    }, [currentMonth]);
    var handleChangeYear = function (date) {
        var newDate = new Date(date.getFullYear(), currentMonth.getMonth());
        goToMonth(newDate);
    };
    var isCurrentYear = function (year) {
        if (isYearDisabled(year))
            return false;
        var isCurrentYear = isSameYear(year, selectedYear);
        return isCurrentYear;
    };
    var isYearDisabled = function (year) {
        if (!fromDate || !toDate)
            return false;
        return !isWithinInterval(year, {
            end: toDate,
            start: fromDate
        });
    };
    return (React.createElement(MenuList, { sx: styles.dropdownPanel },
        React.createElement(Grid, { templateColumns: "repeat(1, 1fr)", columnGap: 6, rowGap: 2, width: "100%", height: "100%", templateRows: "repeat(1, 1fr)" }, years.map(function (year) {
            var _a;
            return (React.createElement(Year, { key: year.toString(), isDisabled: isYearDisabled(year), isSelected: isCurrentYear(year), onClick: function () { return handleChangeYear(year); }, label: _.capitalize((_a = formatYearCaption(year, { locale: locale })) === null || _a === void 0 ? void 0 : _a.toString()) }));
        }))));
};
