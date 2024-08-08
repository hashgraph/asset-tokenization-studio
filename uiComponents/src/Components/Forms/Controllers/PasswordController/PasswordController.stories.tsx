import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { PasswordController } from "./PasswordController";
import { useForm } from "react-hook-form";
import { Icon } from "@/Components/Foundations/Icon";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BasePlatformTheme } from "@/Theme";
import { omit as _omit } from "lodash";
import { Eye, EyeSlash } from "@phosphor-icons/react";

const meta = {
  title: "Design System/Forms/Controllers/PasswordController",
  component: PasswordController,
  args: {
    label: "Hello",
    placeholder: "Hello",
    id: "Name",
  },
  argTypes: {},
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4",
    },
    docs: {},
  },
} as Meta<typeof PasswordController>;
export default meta;

const Template: StoryFn<typeof PasswordController> = (args) => {
  const form = useForm({ mode: "onChange" });
  return <PasswordController {...args} control={form.control} />;
};

export const NoValidations = Template.bind({});
NoValidations.args = {};

export const WithValidations = Template.bind({});
WithValidations.args = {
  rules: { required: "This is required" },
};

export const WithMaxValue = Template.bind({});
WithMaxValue.args = {
  maxLength: 4,
};

export const HideErrors = Template.bind({});
HideErrors.args = {
  rules: { required: "This is required" },
  showErrors: false,
};

export const WithCustomIconsFromProps = Template.bind({});
WithCustomIconsFromProps.args = {
  iconShowPassword: <Icon as={Eye} />,
  iconHidePassword: <Icon as={EyeSlash} />,
};

const TemplateNoTheme: StoryFn<typeof PasswordController> = (args) => {
  const form = useForm({ mode: "onChange" });
  const originalTheme = BasePlatformTheme;

  //@ts-ignore
  originalTheme.components = _omit(
    originalTheme.components,
    "PasswordController"
  );

  return (
    <ChakraProvider theme={extendTheme(originalTheme)}>
      <PasswordController {...args} control={form.control} />
    </ChakraProvider>
  );
};

export const WithoutIconsFromTheme = TemplateNoTheme.bind({});
WithoutIconsFromTheme.args = {};
