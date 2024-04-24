import { icons } from "@/Theme/icons";

import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Icon } from "./Icon";
import { UserRectangle } from "@phosphor-icons/react";

const CustomNameIcons = Object.keys(icons);
const meta = {
  title: "Design System/Foundations/Icon",
  component: Icon,
  argTypes: {
    name: {
      options: CustomNameIcons,
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A7966",
    },
    docs: {},
  },
} as Meta<typeof Icon>;
export default meta;

const Template: StoryFn<typeof Icon> = (args) => {
  return <Icon {...args} />;
};

export const RemixIcon = Template.bind({});
RemixIcon.args = {
  as: UserRectangle,
};

export const CustomIconStory = Template.bind({});
CustomIconStory.args = {
  name: "Progress",
};
CustomIconStory.argTypes = {
  name: {
    control: {
      type: "select",
      options: CustomNameIcons,
    },
  },
};
