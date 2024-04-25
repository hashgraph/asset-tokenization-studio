import React from "react";
export interface MultiTextCellProps {
    text: string | number | React.ReactElement;
    subtext: string | number;
    type: "upper" | "lower";
}
export declare const MultiTextCell: ({ text, subtext, type }: MultiTextCellProps) => JSX.Element;
