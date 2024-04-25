/// <reference types="react" />
import type { InputControllerProps } from "@/Components/Forms";
import type { PopUpProps } from "./types";
interface ConfirmationForm {
    confirmation: string;
}
export interface ConfirmationPopUpProps extends PopUpProps {
    confirmationText: string;
    placeholder?: string;
    errorMessage?: string;
    label?: string;
    inputProps?: Omit<InputControllerProps<ConfirmationForm>, "control" | "id">;
}
export declare const ConfirmationPopUp: ({ confirmationText, onConfirm, placeholder, confirmButtonProps, inputProps, errorMessage, label, variant, title, description, isContentCentered, onCloseComplete, children, ...props }: ConfirmationPopUpProps) => JSX.Element;
export {};
