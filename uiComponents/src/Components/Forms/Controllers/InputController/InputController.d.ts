/// <reference types="react" />
import type { InputProps } from "../../Input";
import type { FieldValues } from "react-hook-form";
import type { InputBaseControllerProps } from "../types";
export interface InputControllerProps<T extends FieldValues> extends InputBaseControllerProps<T>, Omit<InputProps, "id" | "defaultValue" | "onClear"> {
    isClearable?: boolean;
    onClear?: () => void;
}
export declare const InputController: <T extends FieldValues>(props: InputControllerProps<T>) => JSX.Element;
