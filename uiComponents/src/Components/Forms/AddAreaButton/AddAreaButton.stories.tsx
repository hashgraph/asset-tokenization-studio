import type { FlexProps } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import type { AddAreaButtonProps } from "./AddAreaButton";
import { AddAreaButton } from "./AddAreaButton";

const meta = {
  title: "Design System/Forms/AddArea",
  component: AddAreaButton,
  args: {
    containerWidth: "472px",
    children: "Add elements text",
    onClick: () => console.log("Click on Add area button"),
  },
  argTypes: {
    isDisabled: { control: { type: "boolean" } },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/ioBricks-Design-System?type=design&node-id=3635-63030&t=s4x0jqVtY37T19Tn-4",
    },
    docs: {},
  },
} as Meta<typeof AddAreaButton>;
export default meta;

interface AddAreaButtonInContainer extends AddAreaButtonProps {
  containerWidth: FlexProps["width"];
}

const Template: StoryFn<AddAreaButtonInContainer> = ({
  containerWidth,
  ...args
}) => (
  <Flex w={containerWidth}>
    <AddAreaButton {...args} />
  </Flex>
);

export const Default = Template.bind({});
Default.args = {};
