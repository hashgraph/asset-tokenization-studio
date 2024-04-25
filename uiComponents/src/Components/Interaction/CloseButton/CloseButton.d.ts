/// <reference types="react" />
import type { IconButtonProps } from "@/Components/Interaction/IconButton";
export interface CloseButtonProps extends Omit<IconButtonProps, "aria-label"> {
}
export declare const CloseButton: ({ ...props }: CloseButtonProps) => JSX.Element;
