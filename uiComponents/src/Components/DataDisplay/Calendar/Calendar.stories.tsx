import React from "react";
import type { Meta, StoryFn } from "@storybook/react";
import { Text, Box } from "@chakra-ui/react";
import { Calendar } from "./Calendar";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import en from "date-fns/locale/en-US";
import { commonCalendarArgsTypes } from "@/storiesUtils/calendarUtils";

const localeMap = {
  es,
  en,
};

const localeList = Object.keys(localeMap);

const meta = {
  title: "Design System/Data Display/Calendar",
  component: Calendar,
  argTypes: {
    locale: {
      options: localeList,
      mapping: localeMap,
      control: {
        type: "select",
        defaultValue: "en",
      },
      description: "Locale to be used for the calendar",
    },
    colorScheme: {
      control: {
        type: "select",
        defaultValue: "primary",
      },
      describe: "Color scheme to be used for the calendar",
    },
    ...commonCalendarArgsTypes,
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?type=design&node-id=2265-18748&t=8mF1wtSUonz9gMRP-0",
    },
    docs: {},
  },
} as Meta<typeof Calendar>;

export default meta;

const Template: StoryFn<typeof Calendar> = ({
  disabledWeekdays = [],
  ...args
}) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date(2023, 3, 12));
  return (
    <Box>
      <Calendar
        selected={selectedDate}
        fromDate={args.fromDate}
        toDate={args.toDate}
        onSelect={setSelectedDate}
        colorScheme={args.colorScheme}
        locale={args.locale}
        todayTooltip={args.todayTooltip}
        withTimeInput={args.withTimeInput}
        disabledWeekends={args.disabledWeekends}
        disabledWeekdays={disabledWeekdays}
        disabledDates={[args.disabledDates]}
        isDisabled={args.isDisabled}
      />
      {selectedDate && (
        <Text mt={4}>
          Date: {format(selectedDate, "dd/MM/yyyy - hh:mm:ss")}
        </Text>
      )}
    </Box>
  );
};

export const Default = Template.bind({});

Default.args = {
  fromDate: new Date(2022, 0, 1),
  toDate: new Date(2023, 7, 15),
};

export const WithTimeInput = Template.bind({});
WithTimeInput.args = {
  ...Default.args,
  withTimeInput: true,
};
