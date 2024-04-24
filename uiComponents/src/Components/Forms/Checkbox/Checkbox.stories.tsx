import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Icon } from "@/Components/Foundations/Icon";
import { Checkbox } from "./Checkbox";
import { linkTo } from "@storybook/addon-links";
import { Button } from "@Components/Interaction/Button";
import { HouseLine } from "@phosphor-icons/react";

const meta = {
  title: "Design System/Forms/Checkbox",
  component: Checkbox,
  args: {
    variant: "square",
    size: "md",
  },
  argTypes: {
    children: { control: { type: "text" } },
    icon: { control: { type: null } },
    isInvalid: { control: { type: "boolean" } },
    isDisabled: { control: { type: "boolean" } },
    defaultChecked: { control: { type: "boolean" } },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4",
    },
    docs: {},
  },
} as Meta<typeof Checkbox>;
export default meta;

const Template: StoryFn<typeof Checkbox> = (args) => <Checkbox {...args} />;

export const WithChildren = Template.bind({});
WithChildren.args = {
  children: "I accept the Terms and Conditions & Privacy Policy",
};

export const WithOtherIcon = Template.bind({});
WithOtherIcon.args = {
  icon: <Icon as={HouseLine} />,
};

export const IsDisabled = Template.bind({});
IsDisabled.args = {
  isDisabled: true,
};

export const IsInvalid = Template.bind({});
IsInvalid.args = {
  isInvalid: true,
};

export const CheckboxController = () => (
  <Button
    onClick={linkTo("Design System/Forms/Controllers/CheckboxController")}
  >
    Check out the CheckboxController component Stories
  </Button>
);
