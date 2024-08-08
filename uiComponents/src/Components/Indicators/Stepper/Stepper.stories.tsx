import React from "react";
import type { Meta, StoryFn } from "@storybook/react";
import { Stepper, Step } from "./index";

const defaultSteps = [
  {
    title: "First",
    description: "Contact Info",
  },
  { title: "Second", description: "Date & Time" },
  { title: "Third", description: "Select Rooms" },
];

const withoutDescriptionSteps = [
  { title: "First" },
  { title: "Second" },
  { title: "Third" },
];

const longTextSteps = [
  {
    title: "First title so long, lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    title: "Second",
  },
  { title: "Third", description: "Date & Time" },
];

export default {
  title: "Design System/Indicators/Stepper",
  component: Stepper,
  args: {
    index: 1,
  },
} as Meta<typeof Stepper>;

const Template: StoryFn<typeof Stepper> = (args) => (
  <Stepper {...args}>
    {defaultSteps.map((step, index) => (
      <Step key={index} {...step} />
    ))}
  </Stepper>
);

export const Default = Template.bind({});
Default.args = {};

const WithoutDescriptionTemplate: StoryFn<typeof Stepper> = (args) => (
  <Stepper {...args}>
    {withoutDescriptionSteps.map((step, index) => (
      <Step key={index} {...step} />
    ))}
  </Stepper>
);
export const WithoutDescription = WithoutDescriptionTemplate.bind({});

const LongTextsTemplate: StoryFn<typeof Stepper> = (args) => (
  <Stepper {...args}>
    {longTextSteps.map((step, index) => (
      <Step key={index} {...step} />
    ))}
  </Stepper>
);
export const LongTexts = LongTextsTemplate.bind({});
