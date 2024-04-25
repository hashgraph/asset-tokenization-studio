/// <reference types="react" />
import type { CheckboxProps } from "@Components/Forms/Checkbox";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import type { FieldControllerProps } from "../FieldController/FieldController";
export interface CheckboxControllerProps<T extends FieldValues> extends Omit<CheckboxProps, "defaultValue" | "defaultChecked"> {
    control: Control<T>;
    id: UseControllerProps<T>["name"];
    rules?: Record<string, unknown>;
    showErrors?: boolean;
    defaultValue?: UseControllerProps<T>["defaultValue"];
    errorMessageVariant?: FieldControllerProps["errorMessageVariant"];
}
export declare const CheckboxController: <T extends FieldValues>(props: CheckboxControllerProps<T>) => JSX.Element;
