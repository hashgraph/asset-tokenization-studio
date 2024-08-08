import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import type { Meta, StoryFn } from "@storybook/react";

import { CalendarInput } from "./CalendarInput";
import { commonCalendarArgsTypes } from "@/storiesUtils/calendarUtils";

const meta = {
  title: "Design System/Forms/CalendarInput",
  component: CalendarInput,
  args: {
    format: "dd/MM/yyyy",
    withTimeInput: true,
  },
  argTypes: {
    ...commonCalendarArgsTypes,
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4",
    },
    docs: {},
  },
} as Meta<typeof CalendarInput>;
export default meta;

const Template: StoryFn<typeof CalendarInput> = (args) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date(2023, 3, 12));

  return (
    <Flex flexDirection="column" width="200px">
      <CalendarInput
        {...args}
        value={selectedDate}
        onChange={setSelectedDate}
      />
      {selectedDate && (
        <Text mt={4}>
          Date: {format(selectedDate, "dd/MM/yyyy - hh:mm:ss")}
        </Text>
      )}
    </Flex>
  );
};

export const Default = Template.bind({});

export const WithTimeInput = Template.bind({});

WithTimeInput.args = {
  withTimeInput: true,
};
