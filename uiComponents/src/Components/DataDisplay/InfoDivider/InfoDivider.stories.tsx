import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { InfoDivider } from "./InfoDivider";

const meta = {
  title: "Design System/Data Display/InfoDivider",
  component: InfoDivider,
  parameters: {
    docs: {},
  },
  argTypes: {
    type: { options: ["main", "secondary"], control: { type: "radio" } },
  },
  args: {
    title: "Title",
    type: "main",
  },
} as Meta<typeof InfoDivider>;
export default meta;

export const Template: StoryFn<typeof InfoDivider> = (args) => (
  <InfoDivider {...args} />
);
export const WithTitle = Template.bind({});

export const WithNumber = Template.bind({});

WithNumber.args = {
  number: 3,
};

export const WithStep = Template.bind({});

WithStep.args = {
  step: 2,
};

export const WithIsLoading = Template.bind({});

WithIsLoading.args = {
  isLoading: true,
};
