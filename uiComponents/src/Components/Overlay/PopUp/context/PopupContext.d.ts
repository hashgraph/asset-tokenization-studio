import React from "react";
import type { PopupThemeStyle } from "../";
import type { PopUpProps } from "../types";
export type PopupContextProps = Pick<PopUpProps, "footer" | "onCancel" | "onConfirm" | "confirmText" | "cancelText" | "variant" | "title" | "description" | "icon" | "confirmButtonProps" | "cancelButtonProps"> & {
    styles: PopupThemeStyle;
};
export declare const PopupContext: React.Context<PopupContextProps>;
export declare const usePopupContext: () => PopupContextProps;
