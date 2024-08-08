import { Box } from "@chakra-ui/react";

import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Alert } from "./Alert";

const meta = {
  title: "Design System/Overlay/Alert",
  component: Alert,
  argTypes: {
    status: {
      options: ["info", "warning", "error", "success"],
      control: { type: "select" },
    },
    isInline: { control: { type: "boolean" } },
    variant: {
      options: ["subtle", "solid", "left-accent"],
      control: { type: "select" },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10080",
    },
    docs: {},
  },
  args: {
    onClose: () => {
      console.log("onClose");
    },
    status: "info",
    description: "Toast description",
    variant: "subtle",
  },
} as Meta<typeof Alert>;
export default meta;

const Template: StoryFn<typeof Alert> = (args) => {
  return <Alert {...args}></Alert>;
};

export const TemplateWithCustomContent: StoryFn<typeof Alert> = () => {
  return (
    <Alert>
      <Box color="blue" fontWeight="bold">
        Custom text
      </Box>
      <Box>Custom text 2</Box>
    </Alert>
  );
};

export const Error = Template.bind({});
Error.args = {
  status: "error",
  title: "Error title",
};

export const Info = Template.bind({});
Info.args = {
  status: "info",
  title: "Info title",
};

export const Success = Template.bind({});
Success.args = {
  status: "success",
  title: "Success title",
};

export const Warning = Template.bind({});
Warning.args = {
  status: "warning",
  title: "Warning title",
};

export const Loading = Template.bind({});
Loading.args = {
  status: "loading",
  title: "Loading title",
};

export const ErrorLeftAccent = Template.bind({});
ErrorLeftAccent.args = {
  status: "error",
  variant: "leftAccent",
};

export const WarningLeftAccent = Template.bind({});
WarningLeftAccent.args = {
  status: "warning",
  variant: "leftAccent",
};

export const InfoLeftAccent = Template.bind({});
InfoLeftAccent.args = {
  status: "info",
  variant: "leftAccent",
};

export const SuccessLeftAccent = Template.bind({});
SuccessLeftAccent.args = {
  status: "success",
  variant: "leftAccent",
};

export const LoadingLeftAccent = Template.bind({});
LoadingLeftAccent.args = {
  status: "loading",
  variant: "leftAccent",
};

export const CustomChildren = () => (
  <Alert>
    <Box color="blue" fontWeight="bold">
      Custom text
    </Box>
    <Box>Custom text 2</Box>
  </Alert>
);
