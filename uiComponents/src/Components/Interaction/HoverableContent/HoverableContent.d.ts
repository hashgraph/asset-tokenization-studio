import type { FlexProps } from "@chakra-ui/react";
import type { ReactNode } from "react";
export interface HoverableContentProps extends FlexProps {
    hiddenContent: ReactNode;
}
export declare const HoverableContent: ({ children, hiddenContent, ...props }: HoverableContentProps) => JSX.Element;
