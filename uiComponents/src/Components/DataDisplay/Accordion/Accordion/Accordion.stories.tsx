import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Accordion } from ".";
import { AccordionItem } from "../AccordionItem";
import { Box as ChakraBox } from "@chakra-ui/layout";

const AccordionItems = () => {
  return (
    <ChakraBox>
      <AccordionItem title="First Element">
        <p>Content in First Element</p>
      </AccordionItem>
      <AccordionItem title="Second Element">
        <p>Content in Second Element</p>
      </AccordionItem>
      <AccordionItem title="Third Element">
        <p>Content in Third Element</p>
      </AccordionItem>
    </ChakraBox>
  );
};

const meta = {
  title: "Design System/Data Display/Accordion",
  component: Accordion,
  argTypes: {},
  parameters: {
    design: {
      type: "figma",
    },
    docs: {},
  },
  args: {
    children: <AccordionItems />,
  },
} as Meta<typeof Accordion>;

export default meta;

const Template: StoryFn<typeof Accordion> = (args) => {
  return <Accordion {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  title: "Default Accordion",
};

export const DefaultWithDescription = Template.bind({});
DefaultWithDescription.args = {
  title: "Accordion with description",
  description:
    "By default when open an item any other expanded item may be collapsed again",
};

export const AllowMultiple = Template.bind({});
AllowMultiple.args = {
  title: "Expand multiple items at once",
  description: "The accordion permit multiple items to be expanded at once",
  allowMultiple: true,
};
