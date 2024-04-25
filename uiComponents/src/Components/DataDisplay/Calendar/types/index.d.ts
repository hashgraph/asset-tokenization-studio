import type { DayPickerProps } from "react-day-picker";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { ButtonProps } from "@Components/Interaction/Button";
import type { SystemStyleObject as ChakraSystemStyleObject, ChakraStyledOptions } from "@chakra-ui/system";
import type { ColorScheme } from "@Theme/colors";
export declare const calendarPartsList: Array<"footer" | "header" | "container" | "headerTitle" | "day" | "month" | "yearTitle" | "dropdownButton" | "dropdownPanel" | "changeMonthButton" | "timeInput" | "input" | "todayTooltip">;
type Parts = typeof calendarPartsList;
export type CalendarConfigProps = {
    isDisabled?: boolean;
    colorScheme?: ColorScheme;
    isSelected?: boolean;
    isDayHidden?: boolean;
    isToday?: boolean;
};
export type MonthProps = ButtonProps & CalendarConfigProps & {
    isSelected: boolean;
    onClick: () => void;
    label: string;
};
export type CalendarThemeStyle = Partial<Record<Parts[number], ChakraSystemStyleObject>>;
export interface CalendarThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (props: CalendarConfigProps) => CalendarThemeStyle;
}
export type CalendarProps = DayPickerProps & Pick<CalendarConfigProps, "colorScheme" | "isDisabled"> & ChakraStyledOptions & {
    variant?: string;
    onChange?: (date: Date) => void;
    withTimeInput?: boolean;
};
export type MonthLabelKey = "jan" | "feb" | "mar" | "apr" | "may" | "jun" | "jul" | "aug" | "sep" | "oct" | "nov" | "dec";
export type WeekdayLabelKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type CalendarLabelsConfiguration = {
    monthLabels: {
        [key in MonthLabelKey]: string;
    };
};
export {};
