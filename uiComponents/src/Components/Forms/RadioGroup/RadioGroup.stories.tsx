import { Stack as ChakraStack } from "@chakra-ui/react";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { Radio } from "../Radio/Radio";
import { RadioGroup } from "./RadioGroup";
import { linkTo } from "@storybook/addon-links";
import { Button } from "@Components/Interaction/Button";

const meta = {
  title: "Design System/Forms/RadioGroup",
  component: RadioGroup,
  args: {
    children: (
      <ChakraStack align="flex-start">
        <Radio value="check1">Check1</Radio>
        <Radio value="check2">Check2</Radio>
        <Radio value="check3">Check3</Radio>
      </ChakraStack>
    ),
  },
  argTypes: {
    isDisabled: { control: { type: "boolean" } },
    defaultValue: { control: { type: "text" } },
    name: { control: { type: "text" } },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4",
    },
    docs: {},
  },
} as Meta<typeof RadioGroup>;
export default meta;

const Template: StoryFn<typeof RadioGroup> = (args) => <RadioGroup {...args} />;

export const DefaultValue = Template.bind({});
DefaultValue.args = {
  defaultValue: "check2",
};

export const IsDisabled = Template.bind({});
IsDisabled.args = {
  isDisabled: true,
};

export const ControlledRadioGroup = () => (
  <Button
    onClick={linkTo("Design System/Forms/Controllers/RadioGroupController")}
  >
    Check out the RadioGroupController component Stories
  </Button>
);
