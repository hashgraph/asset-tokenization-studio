import type { FieldValues } from "react-hook-form";
import type { InputProps } from "../../Input";
import type { InputControllerProps } from "../InputController/InputController";
import React from "react";
import type { PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
export interface PasswordControllerProps<T extends FieldValues> extends Omit<InputProps, "id" | "defaultValue" | "onClear">, InputControllerProps<T> {
    iconShowPassword?: React.ReactElement;
    iconHidePassword?: React.ReactElement;
}
export declare const passwordControllerPartsList: Array<"iconShowPass" | "iconHidePass">;
type Parts = typeof passwordControllerPartsList;
export interface PasswordControllerThemeConfiguration {
    parts: Parts;
    baseStyle: (({ inputVariant, }: {
        inputVariant: string;
    }) => Partial<PasswordControllerThemeStyle>) | PartsStyleInterpolation<Parts>;
}
type PasswordControllerThemeStyle = Record<Parts[number], React.FunctionComponent>;
export declare const PasswordController: <T extends FieldValues>({ iconShowPassword, iconHidePassword, variant, ...props }: PasswordControllerProps<T>) => JSX.Element;
export {};
