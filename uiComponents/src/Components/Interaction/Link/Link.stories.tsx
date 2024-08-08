import type { Meta, StoryFn } from "@storybook/react";
import { Link } from "./Link";
import React from "react";
import { Box } from "@chakra-ui/react";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { ArrowSquareOut } from "@phosphor-icons/react";

const meta = {
  title: "Design System/Interaction/Link",
  component: Link,
  argTypes: {
    label: {
      description: "Label of the Link",
      control: {
        type: "text",
      },
    },
    variant: {
      options: ["table", "highlighted"],
      control: {
        type: "select",
      },
    },
    isDisabled: {
      control: {
        type: "boolean",
      },
    },
  },
  args: {
    children: "Click me",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/ioBricks-Design-System?type=design&node-id=3629-47231&t=s4x0jqVtY37T19Tn-4",
    },
  },
} as Meta<typeof Link>;
export default meta;

const Template: StoryFn<typeof Link> = (args) => (
  <Box>
    <Link {...args} />
  </Box>
);

export const Highlighted = Template.bind({});
Highlighted.args = {
  variant: "highlighted",
};

export const Table = Template.bind({});
Table.args = {
  variant: "table",
};

export const HighlightedDisabled = Template.bind({});
HighlightedDisabled.args = {
  variant: "highlighted",
  isDisabled: true,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  children: (
    <>
      External link <PhosphorIcon as={ArrowSquareOut} />
    </>
  ),
};
