import type { SortDirection } from "@tanstack/react-table";
import React from "react";
export interface SortIconProps {
    type: SortDirection | false;
    onSort: React.MouseEventHandler<HTMLButtonElement>;
}
export declare const SortIcon: ({ type, onSort }: SortIconProps) => JSX.Element;
