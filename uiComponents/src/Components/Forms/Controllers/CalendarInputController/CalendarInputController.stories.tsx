import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { CalendarInputController } from "./CalendarInputController";
import { useForm } from "react-hook-form";
import { inputArgTypes } from "@/storiesUtils";
import { Flex, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import { commonCalendarArgsTypes } from "@/storiesUtils/calendarUtils";
const rulesOptions = {
  Required: { required: "This is required " },
  MaxLength: { maxLength: { value: 5, message: "Max length is 5" } },
};

const meta = {
  title: "Design System/Forms/Controllers/CalendarInputController",
  component: CalendarInputController,
  args: {
    label: "Label",
    placeholder: "Placeholder",
    id: "Name",
    variant: "outline",
    fromDate: new Date(2021, 0, 1),
    toDate: new Date(2023, 11, 31),
  },
  argTypes: {
    ...commonCalendarArgsTypes,
    ...inputArgTypes,
    control: { control: false },
    defaultValue: { control: false },
    rules: {
      options: Object.keys(rulesOptions),
      mapping: rulesOptions,
      control: {
        type: "select",
        labels: {
          MaxLength: "Max length of 5",
          Required: "Required field",
        },
      },
      description: "Addon at the right of the input",
    },
    value: {
      control: "date",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4",
    },
    docs: {},
  },
} as Meta<typeof CalendarInputController>;
export default meta;

type FieldValue = {
  field: Date;
};
const Template: StoryFn<typeof CalendarInputController> = (args) => {
  const form = useForm<FieldValue>({ mode: "onBlur" });

  const value = form.watch("field");
  return (
    <Flex flexDirection="column">
      <CalendarInputController {...args} id="field" control={form.control} />
      <Text>{value && format(value, "dd/MM/yyyy HH:mm:ss")}</Text>
    </Flex>
  );
};

export const NoValidations = Template.bind({});
NoValidations.args = {};

export const WithValidations = Template.bind({});
WithValidations.args = {
  rules: { required: "This is required" },
};

export const ShowIsSuccess = Template.bind({});
ShowIsSuccess.args = {
  showIsSuccess: true,
};

export const OnChangeCustom = Template.bind({});
OnChangeCustom.args = {
  onChange: (e) => {
    console.log("onChange fired", e);
  },
};

export const OnBlurCustom = Template.bind({});
OnBlurCustom.args = {
  onBlur: () => {
    console.log("onBlur fired");
  },
};

export const HideErrors = Template.bind({});
HideErrors.args = {
  rules: { required: "This is required" },
  showErrors: false,
};

export const WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
  defaultValue: new Date(),
};
