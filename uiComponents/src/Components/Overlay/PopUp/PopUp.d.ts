/// <reference types="react" />
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { PopUpProps } from "./types";
export declare const popUpPartsList: ("overlay" | "container" | "dialog" | "header" | "closeButton" | "body" | "footer" | "icon" | "title" | "description" | "contentContainer" | "inputContainer")[];
type Parts = typeof popUpPartsList;
export interface PopUpThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export type PopupThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export declare const PopUp: ({ showOverlay, showCloseButton, footer, onCancel, onConfirm, confirmText, cancelText, variant, title, description, icon, confirmButtonProps, cancelButtonProps, isContentCentered, ...props }: PopUpProps) => JSX.Element;
export {};
