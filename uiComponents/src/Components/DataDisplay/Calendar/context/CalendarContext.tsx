import React from "react";
import { format } from "date-fns";
import type { CalendarProps } from "../types/index";

export const FORMAT_DATE = "dd/MM/yyyy";

type CalendarContextProps = CalendarProps & {
  todayTooltip?: string;
  timeInputValue: string;
  setTimeInputValue: React.Dispatch<React.SetStateAction<string>>;
  disabledWeekends?: boolean;
  disabledWeekdays?: number[];
  disabledDates?: Date[];
};

export const CalendarContext = React.createContext({} as CalendarContextProps);

export type CalendarProviderProps = React.PropsWithChildren<CalendarProps>;

export const CalendarProvider: React.FC<CalendarProviderProps> = ({
  children,
  ...props
}) => {
  const [timeInputValue, setTimeInputValue] = React.useState<string>(
    props.selected ? format(props.selected as Date, "HH:mm:ss") : ""
  );

  return (
    <CalendarContext.Provider
      value={{
        ...props,
        timeInputValue,
        setTimeInputValue,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => React.useContext(CalendarContext);
