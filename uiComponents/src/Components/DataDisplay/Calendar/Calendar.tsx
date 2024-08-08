import React from "react";
import type { CalendarProps } from "./types";
import { CalendarProvider } from "./context";
import { CalendarPanel } from "./CalendarPanel";
import "react-day-picker/src/style.css";

export const Calendar = (props: CalendarProps) => {
  return (
    <CalendarProvider {...props}>
      <CalendarPanel />
    </CalendarProvider>
  );
};
