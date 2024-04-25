import React from "react";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import type { FieldControllerProps } from "../FieldController/FieldController";
import type { RadioGroupProps } from "@Components/Forms/RadioGroup";
import type { RadioProps } from "@Components/Forms/Radio";
export interface RadioGroupControllerProps<T extends FieldValues> extends Omit<RadioGroupProps, "children" | "onChange"> {
    control: Control<T>;
    id: UseControllerProps<T>["name"];
    rules?: Record<string, unknown>;
    showErrors?: boolean;
    options: Array<{
        value: string;
        label: string;
    }>;
    variant?: RadioProps["variant"];
    errorMessageVariant?: FieldControllerProps["errorMessageVariant"];
    radioProps?: Omit<RadioProps, "variant">;
    defaultValue?: UseControllerProps<T>["defaultValue"];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export declare const RadioGroupController: <T extends FieldValues>({ errorMessageVariant, control, id, variant, showErrors, onChange, onBlur, defaultValue: defaultValueProp, rules, options, radioProps: radioComponentProps, ...props }: RadioGroupControllerProps<T>) => JSX.Element;
