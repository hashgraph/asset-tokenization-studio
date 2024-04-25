import React from "react";
import type { CalendarProps } from "../types/index";
export declare const FORMAT_DATE = "dd/MM/yyyy";
type CalendarContextProps = CalendarProps & {
    todayTooltip?: string;
    timeInputValue: string;
    setTimeInputValue: React.Dispatch<React.SetStateAction<string>>;
    disabledWeekends?: boolean;
    disabledWeekdays?: number[];
    disabledDates?: Date[];
};
export declare const CalendarContext: React.Context<CalendarContextProps>;
export type CalendarProviderProps = React.PropsWithChildren<CalendarProps>;
export declare const CalendarProvider: React.FC<CalendarProviderProps>;
export declare const useCalendarContext: () => CalendarContextProps;
export {};
