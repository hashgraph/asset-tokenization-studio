/// <reference types="react" />
import type { FieldValues } from "react-hook-form";
import type { InputControllerProps } from "../InputController/InputController";
import type { NumericFormatProps } from "react-number-format";
export interface InputNumberControllerProps<T extends FieldValues> extends Omit<InputControllerProps<T>, "type" | "onChange">, Omit<NumericFormatProps, "label" | "width" | "value" | "size" | "id" | "height" | "defaultValue" | "color" | "onChange"> {
    maxValue?: number;
    minValue?: number;
    onChange?: NumericFormatProps["onValueChange"];
}
export declare const InputNumberController: <T extends FieldValues>({ thousandSeparator, decimalSeparator, control, id, variant, showErrors, onChange, onBlur, label, showIsSuccess, defaultValue, rules, maxValue, minValue, ...props }: InputNumberControllerProps<T>) => JSX.Element;
