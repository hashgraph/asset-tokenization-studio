import type { Meta, StoryFn } from "@storybook/react";
import { Horse } from "@phosphor-icons/react";
import React from "react";
import { PhosphorIcon, Weight } from "./PhosphorIcon";

const meta = {
  title: "Design System/Foundations/PhosphorIcon",
  component: PhosphorIcon,
  argTypes: {
    as: {
      description: "The icon from @phosphor-icons/react that we want to render",
      control: false,
    },
    size: {
      control: {
        type: "select",
        options: ["xxs", "xs", "sm", "md"],
      },
      description: "The size of the PhosphorIcon. Must be defined in the theme",
    },
    variant: {
      control: { type: "select", options: ["success", "error"] },
      description:
        "The variant of the PhosphorIcon. Must be defined in the theme",
    },
    weight: {
      description: "The weight of the PhosphorIcon.",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A7966",
    },
    docs: {},
  },
} as Meta<typeof PhosphorIcon>;
export default meta;

const Template: StoryFn<typeof PhosphorIcon> = (args) => {
  return <PhosphorIcon {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  as: Horse,
};

export const Fill = Template.bind({});
Fill.args = {
  as: Horse,
  weight: Weight.Fill,
};
