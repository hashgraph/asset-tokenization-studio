import React from "react";
import type { FlexProps } from "@chakra-ui/react";
export interface SidebarProps extends FlexProps {
    topContent?: React.ReactElement;
    bottomContent?: React.ReactElement;
}
export declare const Sidebar: ({ topContent, bottomContent, ...props }: SidebarProps) => JSX.Element;
