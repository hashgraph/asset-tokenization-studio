import React from "react";
import type { ButtonProps } from "@Components/Interaction/Button";
import type { DayProps as DayComponentProps } from "react-day-picker";
export interface DayProps extends ButtonProps, DayComponentProps {
}
export declare const Day: React.FC<DayProps>;
