import React from "react";
import { Clock } from "@phosphor-icons/react";
import { useDayPicker } from "react-day-picker";
import {
  Divider,
  Flex,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import { useCalendarContext } from "../../context";
import { Input } from "@Components/Forms/Input";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { getZone, parseTimeInputValue } from "../../helpers";

export const CalendarFooter = () => {
  const {
    variant,
    colorScheme,
    isDisabled,
    onChange,
    timeInputValue,
    setTimeInputValue,
  } = useCalendarContext();

  const { selected } = useDayPicker();

  const styles = useChakraMultiStyleConfig("Calendar", {
    colorScheme,
    isDisabled,
    variant,
  });

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = evt.target.value;

    setTimeInputValue(newValue);
    if (newValue) {
      const date = parseTimeInputValue(newValue, selected as Date);
      if (!date) return;
      onChange && onChange(date);
    }
  };

  const disabledInput = selected === undefined || isDisabled;

  return (
    <tfoot>
      <tr>
        <td colSpan={7}>
          <Divider orientation="horizontal" mt={4} />
          <Flex sx={styles.footer}>
            <Flex>
              <Input
                data-testid="time-input"
                addonLeft={
                  <PhosphorIcon
                    as={Clock}
                    weight={Weight.Regular}
                    size="lg"
                    sx={{
                      color: styles.footer?.color,
                    }}
                  />
                }
                size="md"
                sx={styles.timeInput}
                step={1}
                value={timeInputValue}
                type="time"
                disabled={disabledInput}
                onChange={handleChange}
              />
            </Flex>
            <Text>{getZone()}</Text>
          </Flex>
        </td>
      </tr>
    </tfoot>
  );
};
