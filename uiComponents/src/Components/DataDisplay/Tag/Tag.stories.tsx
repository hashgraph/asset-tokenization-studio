import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import type { TagProps } from "./Tag";
import { Tag } from "./Tag";
import { Plus, DotsThreeOutline } from "@phosphor-icons/react";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { iconList, mappedIcons } from "@/storiesUtils";

const commonProps: TagProps = {
  label: "Tag text",
};

const meta = {
  title: "Design System/Data Display/Tag",
  component: Tag,
  argTypes: {
    disabled: {
      description: "Whether the tag is disabled",
      control: { type: "boolean" },
    },
    size: {
      description: "The size of the tag",
      options: ["sm", "lg"],
      control: { type: "radio" },
    },
    leftIcon: {
      description: "The icon to display on the left side of the tag",
      options: iconList,
      mapping: mappedIcons,
      control: {
        type: "select",
      },
    },
    rightIcon: {
      description: "The icon to display on the right side of the tag",
      options: iconList,
      mapping: mappedIcons,
      control: {
        type: "select",
      },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1541%3A28955",
    },
    docs: {},
  },
  args: {},
} as Meta<typeof Tag>;
export default meta;

const Template: StoryFn<typeof Tag> = (args) => {
  return <Tag {...args} />;
};

export const NoIconsSmall = Template.bind({});
NoIconsSmall.args = {
  ...commonProps,
  size: "md",
};

export const NoIconsLarge = Template.bind({});
NoIconsLarge.args = {
  ...commonProps,
  size: "lg",
};

export const NoIconsDisabledSmall = Template.bind({});
NoIconsDisabledSmall.args = {
  ...commonProps,
  disabled: true,
  size: "md",
};

export const NoIconsDisabledLarge = Template.bind({});
NoIconsDisabledLarge.args = {
  ...commonProps,
  disabled: true,
  size: "lg",
};

export const LeftIconSmall = Template.bind({});
LeftIconSmall.args = {
  ...commonProps,
  leftIcon: <PhosphorIcon as={Plus} />,
  size: "md",
};

export const LeftIconLarge = Template.bind({});
LeftIconLarge.args = {
  ...commonProps,
  leftIcon: <PhosphorIcon as={Plus} />,
  size: "lg",
};

export const LeftIconDisabledSmall = Template.bind({});
LeftIconDisabledSmall.args = {
  ...commonProps,
  leftIcon: <PhosphorIcon as={Plus} />,
  disabled: true,
  size: "md",
};

export const LeftIconDisabledLarge = Template.bind({});
LeftIconDisabledLarge.args = {
  ...commonProps,
  leftIcon: <PhosphorIcon as={Plus} />,
  disabled: true,
  size: "lg",
};

export const RightIconSmall = Template.bind({});
RightIconSmall.args = {
  ...commonProps,
  rightIcon: <PhosphorIcon as={DotsThreeOutline} />,
  size: "md",
};

export const RightIconLarge = Template.bind({});
RightIconLarge.args = {
  ...commonProps,
  rightIcon: <PhosphorIcon as={DotsThreeOutline} />,
  size: "lg",
};

export const RightIconDisabledSmall = Template.bind({});
RightIconDisabledSmall.args = {
  ...commonProps,
  rightIcon: <PhosphorIcon as={DotsThreeOutline} />,
  disabled: true,
  size: "md",
};

export const RightIconDisabledLarge = Template.bind({});
RightIconDisabledLarge.args = {
  ...commonProps,
  rightIcon: <PhosphorIcon as={DotsThreeOutline} />,
  disabled: true,
  size: "lg",
};

export const BothIconsSmall = Template.bind({});
BothIconsSmall.args = {
  ...commonProps,
  leftIcon: <PhosphorIcon as={Plus} />,
  rightIcon: <PhosphorIcon as={DotsThreeOutline} />,
  size: "md",
};

export const BothIconsLarge = Template.bind({});
BothIconsLarge.args = {
  ...commonProps,
  leftIcon: <PhosphorIcon as={Plus} />,
  rightIcon: <PhosphorIcon as={DotsThreeOutline} />,
  size: "lg",
};

export const BothIconsDisabledSmall = Template.bind({});
BothIconsDisabledSmall.args = {
  ...commonProps,
  leftIcon: <PhosphorIcon as={Plus} />,
  rightIcon: <PhosphorIcon as={DotsThreeOutline} />,
  disabled: true,
  size: "md",
};

export const BothIconsDisabledLarge = Template.bind({});
BothIconsDisabledLarge.args = {
  ...commonProps,
  leftIcon: <PhosphorIcon as={Plus} />,
  rightIcon: <PhosphorIcon as={DotsThreeOutline} />,
  disabled: true,
  size: "lg",
};

export const JustIconSmall = Template.bind({});
JustIconSmall.args = {
  icon: <PhosphorIcon as={Plus} />,
  size: "md",
};

export const JustIconLarge = Template.bind({});
JustIconLarge.args = {
  icon: <PhosphorIcon as={Plus} />,
  size: "lg",
};

export const JustIconDisabledSmall = Template.bind({});
JustIconDisabledSmall.args = {
  icon: <PhosphorIcon as={Plus} />,
  size: "md",
  disabled: true,
};

export const JustIconDisabledLarge = Template.bind({});
JustIconDisabledLarge.args = {
  icon: <PhosphorIcon as={Plus} />,
  disabled: true,
  size: "lg",
};

export const WithIsLoading = Template.bind({});
WithIsLoading.args = {
  ...commonProps,
  isLoading: true,
};
