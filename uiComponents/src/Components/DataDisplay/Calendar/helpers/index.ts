import { parse } from "date-fns";
import { countBy as _countBy } from "lodash";
export const getZone = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeZoneName: "short",
    hour12: false,
  };
  return now.toLocaleString("en-US", options).split(" ")[2];
};

export const parseTimeInputValue = (
  value?: string,
  selectedDate?: Date
): Date | undefined => {
  let date: Date | undefined;

  if (!value || !selectedDate) return date;

  if (_countBy(value, (c) => c === ":").true === 1) {
    date = parse(value, "HH:mm", selectedDate as Date);
  }
  if (_countBy(value, (c) => c === ":").true === 2) {
    date = parse(value, "HH:mm:ss", selectedDate as Date);
  }

  return date;
};
