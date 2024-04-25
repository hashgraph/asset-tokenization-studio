/// <reference types="react" />
import type { ToastComponentPropsPick } from "@Components/Overlay/Toast";
type ToastComponentProps = ToastComponentPropsPick<"status" | "onClose" | "description" | "title">;
export declare function ToastComponent({ status, onClose, description, title, }: ToastComponentProps): JSX.Element;
export {};
