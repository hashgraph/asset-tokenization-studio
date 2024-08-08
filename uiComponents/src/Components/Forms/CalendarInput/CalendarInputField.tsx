import React from "react";
import { PopoverTrigger } from "@chakra-ui/popover";
import { format as formatFn } from "date-fns";
import type { InputProps } from "@Components/Forms/Input";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { CalendarBlank, CaretDown } from "@phosphor-icons/react";
import { Input } from "@Components/Forms/Input";

export const DEFAULT_FORMAT_DATE = "dd/MM/yyyy";

export interface CalendarInputFieldProps
  extends Omit<InputProps, "onChange" | "value" | "defaultValue"> {
  value?: Date;
  defaultValue?: Date;
  format?: string;
}

export const CalendarInputField = ({
  value,
  defaultValue,
  format = DEFAULT_FORMAT_DATE,
  ...props
}: CalendarInputFieldProps) => {
  return (
    <PopoverTrigger>
      <Input
        aria-label="Date"
        autoComplete="off"
        value={value ? formatFn(value, format) : ""}
        addonLeft={<PhosphorIcon as={CalendarBlank} color="neutral.500" />}
        addonRight={
          <PhosphorIcon
            _hover={{
              cursor: "pointer",
            }}
            as={CaretDown}
            size="lg"
            color="neutral.500"
            aria-label="Select a date"
          />
        }
        {...props}
        onChange={() => {}}
      />
    </PopoverTrigger>
  );
};
