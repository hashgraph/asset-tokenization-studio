/// <reference types="react" />
import type { InputProps } from "@Components/Forms/Input";
export declare const DEFAULT_FORMAT_DATE = "dd/MM/yyyy";
export interface CalendarInputFieldProps extends Omit<InputProps, "onChange" | "value" | "defaultValue"> {
    value?: Date;
    defaultValue?: Date;
    format?: string;
}
export declare const CalendarInputField: ({ value, defaultValue, format, ...props }: CalendarInputFieldProps) => JSX.Element;
