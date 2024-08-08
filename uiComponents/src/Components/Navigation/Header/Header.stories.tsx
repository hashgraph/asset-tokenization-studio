import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Header } from "./Header";
import { Stack } from "@chakra-ui/react";
import { Logo } from "@/Components/Basic/Logo";
import { Text } from "@/Components/Foundations/Text";
import { Avatar } from "@/Components/Basic/Avatar";

const meta = {
  title: "Design System/Navigation/Header",
  component: Header,
  argTypes: {
    leftContent: { control: false, description: "Left content of the header" },
    rightContent: {
      control: false,
      description: "Right content of the header",
    },
    contentContainerProps: {
      control: false,
      description: "Used to modify the wrapper of the left and right content",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1860-13948&t=3ozoVrWQYvgw1fj3-4",
    },
    docs: {},
  },
} as Meta<typeof Header>;
export default meta;

const Template: StoryFn<typeof Header> = (args) => {
  return <Header {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  leftContent: <Logo alt="IOB" />,
  rightContent: (
    <Stack align="center" direction="row">
      <Text textStyle="ElementsMediumXS">Username</Text>
      <Avatar />
    </Stack>
  ),
};

export const HeaderOnlyLeftContent = Template.bind({});
HeaderOnlyLeftContent.args = {
  leftContent: <Logo alt="IOB" />,
};

export const HeaderOnlyRightContent = Template.bind({});
HeaderOnlyRightContent.args = {
  rightContent: (
    <Stack align="center" direction="row">
      <Text textStyle="ElementsMediumXS">Username</Text>
      <Avatar />
    </Stack>
  ),
};
