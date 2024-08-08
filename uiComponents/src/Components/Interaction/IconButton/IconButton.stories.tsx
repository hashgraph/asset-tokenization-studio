import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import {
  buttonStatus,
  iconButtonSizes,
  iconButtonVariants,
  iconList,
  mappedIcons,
} from "@/storiesUtils";
import { IconButton } from "./IconButton";
import { ArrowRight, Plus } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";

const commonVariantArgs = {
  icon: <PhosphorIcon as={Plus} />,
};

const meta = {
  title: "Design System/Interaction/IconButton",
  component: IconButton,
  argTypes: {
    isDisabled: {
      control: {
        type: "boolean",
      },
      description:
        "If it is true, the button will be shown as deactivated and cannot be interacted with it. This is a good option to indicate to the user that he cannot perform some action at that time.",
    },
    variant: {
      options: iconButtonVariants,
      control: "select",
      description:
        "Define the visual style of the button. The available options are `Primary`, `Secondary`, `Danger` and `Tertiary`. This is useful when you want to use different buttons styles for different actions.",
    },
    size: {
      options: iconButtonSizes,
      control: "select",
      description:
        "Define the size of the button. The available options are `XS`, `SM`, `MD`, `LG` and `XL`. This can be useful when you want to use different buttons sizes for different devices or for different areas of the user interface where larger or smaller buttons are desired.",
    },
    icon: {
      options: iconList,
      control: {
        type: "select",
      },
      mapping: mappedIcons,
      description: "Define the icon that will be rendered inside the button",
      defaultValue: Plus,
    },
    onClick: { action: "onClick" },
    isLoading: {
      control: "boolean",
      description: "Toggle to put the button in loading state",
    },
    status: {
      options: buttonStatus,
      control: "select",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A7966",
    },
    docs: {},
  },
  args: {
    icon: <PhosphorIcon as={ArrowRight} />,
  },
} as Meta<typeof IconButton>;
export default meta;

const Template: StoryFn<typeof IconButton> = (args) => <IconButton {...args} />;

export const ExtraSmall = Template.bind({});
ExtraSmall.args = {
  ...commonVariantArgs,
  size: "xs",
};
export const Small = Template.bind({});
Small.args = {
  ...commonVariantArgs,
  size: "sm",
};

export const Medium = Template.bind({});
Medium.args = {
  ...commonVariantArgs,
  size: "md",
};

export const Primary = Template.bind({});
Primary.args = {
  ...commonVariantArgs,
  variant: "primary",
  size: "md",
};

export const PrimaryDisabled = Template.bind({});
PrimaryDisabled.args = {
  ...commonVariantArgs,
  variant: "primary",
  size: "md",
  isDisabled: true,
};

export const Secondary = Template.bind({});
Secondary.args = {
  ...commonVariantArgs,
  variant: "secondary",
  size: "md",
};

export const SecondaryDisabled = Template.bind({});
SecondaryDisabled.args = {
  ...commonVariantArgs,
  variant: "secondary",
  size: "md",
  isDisabled: true,
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  ...commonVariantArgs,
  variant: "tertiary",
  size: "md",
};

export const TertiaryDisabled = Template.bind({});
TertiaryDisabled.args = {
  ...commonVariantArgs,
  variant: "tertiary",
  size: "md",
  isDisabled: true,
};
