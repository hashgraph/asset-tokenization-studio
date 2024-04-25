/// <reference types="react" />
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import type { ToggleProps } from "@Components/Forms/Toggle";
export interface ToggleControllerProps<T extends FieldValues> extends ToggleProps {
    control: Control<T>;
    id: UseControllerProps<T>["name"];
    defaultValue?: UseControllerProps<T>["defaultValue"];
    rules?: Record<string, unknown>;
    showErrors?: boolean;
}
export declare const ToggleController: <T extends FieldValues>(props: ToggleControllerProps<T>) => JSX.Element;
