/// <reference types="react" />
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import type { TextareaProps } from "../../Textarea";
export interface TextareaControllerProps<T extends FieldValues> extends TextareaProps {
    control: Control<T>;
    id: UseControllerProps<T>["name"];
    defaultValue?: UseControllerProps<T>["defaultValue"];
    rules?: Record<string, unknown>;
    showErrors?: boolean;
    showIsSuccess?: boolean;
}
export declare const TextareaController: <T extends FieldValues>(props: TextareaControllerProps<T>) => JSX.Element;
