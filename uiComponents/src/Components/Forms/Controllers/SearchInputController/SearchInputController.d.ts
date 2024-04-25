/// <reference types="react" />
import { type FieldValues } from "react-hook-form";
import type { InputProps } from "../../Input";
import type { InputControllerProps } from "../InputController/InputController";
export interface SearchInputControllerProps<T extends FieldValues> extends Omit<InputProps, "id" | "defaultValue" | "onClear">, InputControllerProps<T> {
    minSearchLength?: number;
    onSearch: (value: string) => void;
}
export declare const SearchInputController: <T extends FieldValues>({ variant, control, rules, id, defaultValue, minSearchLength, onSearch, ...props }: SearchInputControllerProps<T>) => JSX.Element;
