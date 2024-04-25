import type { AlertProps as ChakraAlertProps } from "@chakra-ui/alert";
import type { alertAnatomy as ChakraAlertParts } from "@chakra-ui/anatomy";
import type { ComponentWithAs, SystemStyleObject } from "@chakra-ui/system";
import React from "react";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@Theme/Components/BaseMultiStyleConfiguration";
import type { PhosphorIconProps } from "@/Components/Foundations/PhosphorIcon";
type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends any ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>> : never;
type StrictUnion<T> = StrictUnionHelper<T, T>;
export interface BaseAlertProps extends Omit<ChakraAlertProps, "children" | "title" | "status"> {
    isInline?: boolean;
    onClose?(): void;
    showIcon?: boolean;
    status?: AlertStatus;
}
export interface CustomChildrenAlertProps {
    children: React.ReactNode;
}
export interface TitleDescriptionAlertProps {
    title?: string;
    description?: string;
}
export type AlertProps = BaseAlertProps & StrictUnion<TitleDescriptionAlertProps | CustomChildrenAlertProps>;
export declare const alertPartsList: Array<(typeof ChakraAlertParts.keys)[number] | "closeBtn" | "contentContainer">;
type Parts = typeof alertPartsList;
export type AlertStatus = "success" | "warning" | "error" | "info" | "loading";
export interface AlertThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (({ status }: {
        status: AlertStatus;
    }) => Partial<AlertThemeStyle>) | PartsStyleInterpolation<Parts>;
}
type AlertThemeStyle = Record<Parts[number], SystemStyleObject> & {
    icon: PhosphorIconProps;
};
export declare const Alert: ComponentWithAs<"div", AlertProps>;
export {};
