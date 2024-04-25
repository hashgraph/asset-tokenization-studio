/// <reference types="react" />
import type { PopUpProps } from "../types";
export type PopupFooterProps = Pick<PopUpProps, "confirmText" | "cancelText" | "onCancel" | "onConfirm" | "confirmButtonProps" | "cancelButtonProps">;
export declare const PopupFooter: ({ confirmText: okTextArg, cancelText: cancelTextArg, onCancel: onCancelArg, onConfirm: onConfirmArg, cancelButtonProps: cancelButtonPropsArg, confirmButtonProps: confirmButtonPropsArg, }: PopupFooterProps) => JSX.Element;
