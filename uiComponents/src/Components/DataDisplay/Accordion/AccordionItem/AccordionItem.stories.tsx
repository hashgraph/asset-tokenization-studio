import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { AccordionItem } from ".";
import { Accordion } from "../Accordion";
import { ArrowDown } from "@phosphor-icons/react";
import { Tag } from "../../Tag";
import {
  HStack as ChakraHStack,
  AccordionButton as ChakraAccordionButton,
  AccordionIcon as ChakraAccordionIcon,
  Button as ChakraButton,
} from "@chakra-ui/react";

const meta = {
  title: "Design System/Data Display/Accordion/AccordionItem",
  component: AccordionItem,
  argTypes: {
    variant: {},
  },
  parameters: {
    design: {},
    docs: {},
  },
  args: {
    children: <p>This is the item content</p>,
  },
} as Meta<typeof AccordionItem>;
export default meta;

const Template: StoryFn<typeof AccordionItem> = (args) => {
  return (
    <Accordion title="Accordion Title">
      <AccordionItem {...args} />
    </Accordion>
  );
};

export const DefaultIcon = Template.bind({});
DefaultIcon.args = {
  title: "Accordion Item Title",
};

export const CustomIcon = Template.bind({});
CustomIcon.args = {
  title: "Accordion Item with custom icon from Phosphor",
  icon: ArrowDown,
};

export const CustomTitleComponent = () => (
  <ChakraHStack
    w="full"
    justify="space-between"
    px={4}
    data-testid="custom-title"
  >
    <ChakraHStack>
      <ChakraAccordionButton data-testid="custom-title-button">
        <h2>Admin</h2>
        <ChakraAccordionIcon />
      </ChakraAccordionButton>
      <ChakraHStack w="auto">
        <Tag label="Complement" size="sm" />
      </ChakraHStack>
    </ChakraHStack>
    <ChakraHStack>
      <ChakraButton size="sm" onClick={() => alert("You click on me")}>
        Click
      </ChakraButton>
    </ChakraHStack>
  </ChakraHStack>
);

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  customTitle: <CustomTitleComponent />,
};
