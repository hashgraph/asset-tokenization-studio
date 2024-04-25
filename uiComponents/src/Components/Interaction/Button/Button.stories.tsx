import React from "react";
import type { Meta, StoryFn } from "@storybook/react";
import { Plus, DotsThree } from "@phosphor-icons/react";
import type { ButtonProps } from "./Button";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { Button } from "./Button";
import {
  allButtonVariants,
  iconLabels,
  iconList,
  mappedIcons,
  allSizes,
  buttonStatus,
} from "@/storiesUtils";

const commonArgs = {
  children: "Button",
  variant: "primary",
  size: "lg",
};

const commonArgsTypes = {
  isDisabled: {
    control: {
      type: "boolean",
    },
    description:
      "If it is true, the button will be shown as deactivated and cannot be interacted with it. This is a good option to indicate to the user that he cannot perform some action at that time.",
  },
  onClick: {
    action: "onClick",
    description: "The function to be called when the button is clicked",
  },
  variant: {
    options: allButtonVariants,
    control: {
      type: "radio",
    },
    description:
      "Define the visual style of the button. The available options are `Primary`, `Secondary`, `Danger` and `Tertiary`. This is useful when you want to use different buttons styles for different actions.",
  },
  size: {
    options: allSizes,
    control: { type: "radio" },
    description:
      "Define the size of the button. The available options are `md` and `lg`. This can be useful when you want to use different buttons sizes for different devices or for different areas of the user interface where larger or smaller buttons are desired.",
  },
  isLoading: {
    control: "boolean",
    description: "Toggle to put the button in loading state",
  },
};

const commonArgsWithIcons: ButtonProps = {
  ...commonArgs,
  leftIcon: <PhosphorIcon as={Plus} />,
  rightIcon: <PhosphorIcon as={DotsThree} />,
};

const commonArgsTypesWithIcons: any = {
  ...commonArgsTypes,
  leftIcon: {
    options: iconList,
    control: {
      type: "select",
      labels: iconLabels,
      mapping: mappedIcons,
      required: false,
    },
    mapping: mappedIcons,
    description: "Icon to be displayed on the left side of the button",
  },
  rightIcon: {
    options: iconList,
    control: {
      type: "select",
      labels: iconLabels,
      mapping: mappedIcons,
      required: false,
    },
    mapping: mappedIcons,
    description: "Icon to be displayed on the right side of the button",
  },
};

const meta = {
  title: "Design System/Interaction/Button",
  component: Button,
  argTypes: {
    ...commonArgsTypes,
    status: {
      options: buttonStatus,
      control: { type: "select" },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A23012&t=uLoNHekrc4UjtgwE-0",
    },
  },
} as Meta<typeof Button>;
export default meta;

const Template: StoryFn<typeof Button> = (args) => <Button {...args} />;

// Primary
export const Primary = Template.bind({});

Primary.args = {
  ...commonArgs,
};

Primary.argTypes = {
  ...commonArgsTypes,
};

export const PrimaryWithIcon = Template.bind({});

PrimaryWithIcon.argTypes = {
  ...commonArgsTypesWithIcons,
};

PrimaryWithIcon.args = {
  ...commonArgsWithIcons,
  variant: "primary",
};

export const PrimaryWithLoading = Template.bind({});

PrimaryWithLoading.argTypes = {
  ...commonArgsTypes,
};

PrimaryWithLoading.args = {
  ...commonArgs,
  variant: "primary",
  isLoading: true,
  loadingText: "Loading",
};

export const PrimaryDisabled = Template.bind({});

PrimaryDisabled.argTypes = {
  ...commonArgsTypes,
};

PrimaryDisabled.args = {
  ...commonArgs,
  variant: "primary",
  isDisabled: true,
};

// Secondary
export const Secondary = Template.bind({});

Secondary.args = {
  ...commonArgs,
  variant: "secondary",
};

Secondary.argTypes = {
  ...commonArgsTypes,
};

export const SecondaryWithIcon = Template.bind({});

SecondaryWithIcon.argTypes = {
  ...commonArgsTypesWithIcons,
};

SecondaryWithIcon.args = {
  ...commonArgsWithIcons,
  variant: "secondary",
};

export const SecondaryWithLoading = Template.bind({});

SecondaryWithLoading.args = {
  ...commonArgs,
  variant: "secondary",
  isLoading: true,
  loadingText: "Loading",
};

SecondaryWithLoading.argTypes = {
  ...commonArgsTypes,
};

export const SecondaryDisabled = Template.bind({});

SecondaryDisabled.args = {
  ...commonArgs,
  variant: "secondary",
  isDisabled: true,
};

SecondaryDisabled.argTypes = {
  ...commonArgsTypes,
};

// Tertiary
export const Tertiary = Template.bind({});

Tertiary.args = {
  ...commonArgs,
  variant: "tertiary",
};

Tertiary.argTypes = {
  ...commonArgsTypes,
};

export const TertiaryWithLoading = Template.bind({});

TertiaryWithLoading.args = {
  ...commonArgs,
  variant: "tertiary",
  isLoading: true,
  loadingText: "Loading",
};

TertiaryWithLoading.argTypes = {
  ...commonArgsTypes,
};

export const TertiaryDisabled = Template.bind({});

TertiaryDisabled.args = {
  ...commonArgs,
  variant: "tertiary",
  isDisabled: true,
};

TertiaryDisabled.argTypes = {
  ...commonArgsTypes,
};

export const TertiaryWithIcon = Template.bind({});

TertiaryWithIcon.argTypes = {
  ...commonArgsTypesWithIcons,
};

TertiaryWithIcon.args = {
  ...commonArgsWithIcons,
  variant: "tertiary",
};

// Danger
export const Danger = Template.bind({});

Danger.args = {
  ...commonArgs,
  variant: "primary",
  status: "error",
};

Danger.argTypes = {
  ...commonArgsTypes,
};

export const DangerWithLoading = Template.bind({});

DangerWithLoading.args = {
  ...commonArgs,
  variant: "primary",
  status: "error",
  isLoading: true,
  loadingText: "Loading",
};

DangerWithLoading.argTypes = {
  ...commonArgsTypes,
};

export const DangerDisabled = Template.bind({});

DangerDisabled.args = {
  ...commonArgs,
  variant: "primary",
  status: "error",
  isDisabled: true,
};

DangerDisabled.argTypes = {
  ...commonArgsTypes,
};

export const DangerWithIcon = Template.bind({});

DangerWithIcon.argTypes = {
  ...commonArgsTypesWithIcons,
};

DangerWithIcon.args = {
  ...commonArgsWithIcons,
  variant: "primary",
  status: "error",
};
