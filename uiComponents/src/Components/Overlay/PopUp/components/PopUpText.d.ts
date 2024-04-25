import React from "react";
export interface PopupTextProps {
    type?: "title" | "description";
    label: string | React.ReactNode;
}
export declare const PopUpText: ({ type, label }: PopupTextProps) => JSX.Element;
