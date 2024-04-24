import { Button } from "@Components/Interaction/Button";

import { linkTo } from "@storybook/addon-links";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Textarea } from "./Textarea";

const meta = {
  title: "Design System/Forms/Textarea",
  component: Textarea,
  args: {
    placeholder: "Placeholder",
    label: "Label",
  },
  argTypes: {
    showRequired: {
      control: { type: "boolean" },
      description:
        "Boolean that toggles whether to show the * if it is required.",
    },
    isRequired: {
      control: { type: "boolean" },
      description: "Boolean to specify that the input is required.",
    },
    isDisabled: {
      control: { type: "boolean" },
      description: "Boolean to specify if the input is disabled.",
    },
    isSuccess: {
      control: { type: "boolean" },
      description: "Boolean to specify that the input is valid and success.",
    },
    placeholder: {
      description: "Placeholder of the input.",
    },
    label: {
      description: "Label of the input.",
    },
    variant: {
      control: false,
      description: "Variant of the input. Must be defined in the theme.",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=CYTpHR0mFDJMv5GO-4",
    },
    docs: {},
  },
} as Meta<typeof Textarea>;
export default meta;

const Template: StoryFn<typeof Textarea> = (args) => <Textarea {...args} />;

export const Default = Template.bind({});

export const Disabled = Template.bind({});

Disabled.args = {
  isDisabled: true,
};

export const Invalid = Template.bind({});

Invalid.args = {
  isInvalid: true,
};

export const Valid = Template.bind({});

Valid.args = {
  isSuccess: true,
};

export const WithMaxLength = Template.bind({});

WithMaxLength.args = {
  maxLength: 100,
};

export const ControlledTextarea = () => (
  <Button
    onClick={linkTo("Design System/Forms/Controllers/TextareaController")}
  >
    Check out the TextareaController component stories
  </Button>
);
