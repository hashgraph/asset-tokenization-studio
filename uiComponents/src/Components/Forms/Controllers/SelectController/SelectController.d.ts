/// <reference types="react" />
import type { SelectProps } from "../../Select";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
export interface SelectControllerProps<T extends FieldValues> extends Omit<SelectProps, "onChange" | "onBlur"> {
    control: Control<T>;
    id: UseControllerProps<T>["name"];
    rules?: Record<string, unknown>;
    showErrors?: boolean;
    onChange?: (value: SelectOption | SelectOption["value"]) => void;
    setsFullOption?: boolean;
}
export interface SelectOption<T = string, Y = string> {
    value: T;
    label: Y;
}
export declare const SelectController: <T extends FieldValues>(props: SelectControllerProps<T>) => JSX.Element;
