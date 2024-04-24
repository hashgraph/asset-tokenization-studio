import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { ThemeStoryWrapper } from "@Components/story-config";
import { InputNumberController } from "./InputNumberController";
import { useForm } from "react-hook-form";
import { inputArgTypes } from "@/storiesUtils";
import { Title, ArgsTable, PRIMARY_STORY } from "@storybook/addon-docs";
import { MarkdownText } from "@/Components/Foundations/MarkdownText";

const rulesOptions = {
  Required: { required: "This is required " },
  MaxLength: { maxLength: { value: 5, message: "Max length is 5" } },
};

const meta = {
  title: "Design System/Forms/Controllers/InputNumberController",
  component: InputNumberController,
  args: {
    label: "Label",
    placeholder: "Placeholder",
    id: "Name",
    variant: "outline",
    onValueChange: undefined,
    suffix: "€",
  },
  argTypes: {
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
    onValueChange: { control: false },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4",
    },
    docs: {
      page: () => (
        <ThemeStoryWrapper>
          <Title />
          <MarkdownText>
            {`This component uses the library [react-number-format](https://github.com/s-yadav/react-number-format). Please refer to the documentation for more information on the props that InputNumberController can receive.`}
          </MarkdownText>
          <ArgsTable story={PRIMARY_STORY} />
        </ThemeStoryWrapper>
      ),
    },
  },
} as Meta<typeof InputNumberController>;
export default meta;

type FieldValue = {
  field: string;
};
const Template: StoryFn<typeof InputNumberController> = (args) => {
  const form = useForm<FieldValue>({ mode: "onChange" });
  return <InputNumberController {...args} id="field" control={form.control} />;
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
  onBlur: (e) => {
    console.log("onBlur fired", e);
  },
};

export const HideErrors = Template.bind({});
HideErrors.args = {
  rules: { required: "This is required" },
  showErrors: false,
};

export const WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
  defaultValue: 0,
};

export const WithMaxValue = Template.bind({});
WithMaxValue.args = {
  maxValue: 100,
};

export const WithMinValue = Template.bind({});
WithMinValue.args = {
  minValue: 50,
};

export const WithMinAndMaxValue = Template.bind({});
WithMinAndMaxValue.args = {
  minValue: 10,
  maxValue: 20,
};
