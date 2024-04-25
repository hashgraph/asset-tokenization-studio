import React from "react";
import { Button, Flex } from "@chakra-ui/react";
import type { Meta, StoryFn } from "@storybook/react";

import { Tooltip } from "./Tooltip";
import { Info } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";

const meta = {
  title: "Design System/Overlay/Tooltip",
  component: Tooltip,
  argTypes: {
    placement: {
      description: "Tooltip placement",
      options: [
        "auto-start",
        "auto",
        "auto-end",
        "top-start",
        "top",
        "top-end",
        "right-start",
        "right",
        "right-end",
        "bottom-start",
        "bottom",
        "bottom-end",
        "left-start",
        "left",
        "left-end",
      ],
      control: {
        type: "select",
      },
    },
    hasArrow: {
      description: "Tooltip with arrow",
      options: [true, false],
      control: {
        type: "select",
      },
    },
    label: {
      description: "Tooltip label",
      defaultValue: "tooltip",
      control: {
        type: "object",
      },
    },
    variant: {
      description: "Variant",
      options: ["light", "dark"],
      control: {
        type: "select",
      },
    },
    children: {
      control: {
        type: null,
      },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A6678",
    },
  },
  args: {
    trigger: "hover",
    children: <Button>hover me!</Button>,
    label:
      "Here’s a regular tooltip with some text inside of it that’s supposed to be substantially large.",
  },
} as Meta<typeof Tooltip>;
export default meta;

const Template: StoryFn<typeof Tooltip> = ({ label, ...args }) => (
  <Flex align="center" pos="relative" maxW="10px">
    <Tooltip label={label} {...args}></Tooltip>
  </Flex>
);

export const HoverText = Template.bind({});
HoverText.args = {
  placement: "top",
};

export const HoverIcon = Template.bind({});
HoverIcon.args = {
  children: <PhosphorIcon as={Info} size="small" p="2px" />,
};

export const CenterTop = Template.bind({});
CenterTop.args = {
  placement: "top",
  label: "Here's a short tooltip",
};

export const LeftTop = Template.bind({});
LeftTop.args = {
  placement: "top-start",
  label: "Here's a short tooltip",
};

export const RightTop = Template.bind({});
RightTop.args = {
  placement: "top-end",
  label: "Here's a short tooltip",
};

export const CenterBottom = Template.bind({});
CenterBottom.args = {
  placement: "bottom",
  label: "Here's a short tooltip",
};

export const LeftBottom = Template.bind({});
LeftBottom.args = {
  placement: "bottom-start",
  label: "Here's a short tooltip",
};

export const RightBottom = Template.bind({});
RightBottom.args = {
  placement: "bottom-end",
  label: "Here's a short tooltip",
};

export const Left = Template.bind({});
Left.args = {
  placement: "left",
  label: "Here's a short tooltip",
};

export const Right = Template.bind({});
Right.args = {
  placement: "right",
  label: "Here's a short tooltip",
};
