/// <reference types="react" />
import type { CalendarInputProps } from "@Components/Forms/CalendarInput";
import type { FieldValues } from "react-hook-form";
import type { InputBaseControllerProps } from "../types";
export interface CalendarInputControllerProps<T extends FieldValues> extends InputBaseControllerProps<T>, Omit<CalendarInputProps, "defaultValue" | "id"> {
}
export declare const CalendarInputController: <T extends FieldValues>(props: CalendarInputControllerProps<T>) => JSX.Element;
