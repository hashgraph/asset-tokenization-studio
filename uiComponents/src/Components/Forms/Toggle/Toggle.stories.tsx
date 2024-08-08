import { Button } from "@Components/Interaction/Button";

import { linkTo } from "@storybook/addon-links";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Toggle } from "./Toggle";

const meta = {
  title: "Design System/Forms/Toggle",
  component: Toggle,
  argTypes: {
    isDisabled: {
      control: { type: "boolean" },
      description: "Boolean to specify if the input is disabled.",
    },
    isInvalid: {
      control: { type: "boolean" },
      description: "Boolean to specify if the input is invalid.",
    },
    size: {
      control: false,
      description:
        "The size of the toggle. Must be defined in the theme (inside Switch component)",
    },
    variant: {
      description:
        "The variant of the toggle. Must be defined in the theme (inside Switch component)",
    },
    label: { description: "The label of the toggle" },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4",
    },
    docs: {},
  },
  args: {
    size: "md",
  },
} as Meta<typeof Toggle>;
export default meta;

const Template: StoryFn<typeof Toggle> = (args) => {
  return <Toggle {...args} />;
};

export const Simple = Template.bind({});
Simple.args = {};

export const IsDisabled = Template.bind({});
IsDisabled.args = {
  isDisabled: true,
};

export const IsInvalid = Template.bind({});
IsInvalid.args = {
  isInvalid: true,
};

export const Compound = Template.bind({});
Compound.args = {
  label: "Click to Toggle! :)",
};

export const ControlledToggle = () => (
  <Button onClick={linkTo("Design System/Forms/Controllers/ToggleController")}>
    Check out the ToggleController component Stories
  </Button>
);
