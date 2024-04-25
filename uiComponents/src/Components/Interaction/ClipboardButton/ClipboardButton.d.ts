/// <reference types="react" />
import type { BaseMultiStyleConfiguration } from "@Theme/Components/BaseMultiStyleConfiguration";
import type { IconButtonProps } from "@Components/Interaction/IconButton";
export declare const clipboardButtonPartsList: Array<"iconButton" | "icon" | "tooltip">;
type Parts = typeof clipboardButtonPartsList;
export interface ClipboardButtonConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export interface ClipboardButtonProps extends Omit<IconButtonProps, "as" | "onClick" | "aria-label"> {
    value: string;
    variant?: string;
    size?: string;
}
export declare const ClipboardButton: ({ value, variant, size, ...props }: ClipboardButtonProps) => JSX.Element;
export {};
