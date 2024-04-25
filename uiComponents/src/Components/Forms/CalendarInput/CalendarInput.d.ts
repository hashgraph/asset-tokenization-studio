/// <reference types="react" />
import type { CalendarInputFieldProps } from "./CalendarInputField";
import type { CalendarProviderProps } from "@Components/DataDisplay/Calendar";
export type CalendarInputProps = CalendarInputFieldProps & Partial<Pick<CalendarProviderProps, "colorScheme" | "locale" | "todayTooltip" | "variant" | "withTimeInput" | "fromDate" | "toDate" | "disabledWeekends" | "disabledWeekdays" | "disabledDates">> & {
    onChange?: (date: Date) => void;
    onClose?: () => void;
    onBlur?: () => void;
    calendarProps?: CalendarProviderProps;
};
export declare const CalendarInput: ({ colorScheme, locale, todayTooltip, variant, onClose, withTimeInput, fromDate, toDate, disabledWeekends, disabledWeekdays, disabledDates, calendarProps: calendarPropsArgs, ...props }: CalendarInputProps) => JSX.Element;
