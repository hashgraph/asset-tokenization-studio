import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { Tabs } from "./Tabs";

const tabs = [...Array(5)].map((_el, index) => ({
  header: `Tab ${index + 1}`,
  content: `Tab ${index + 1} Content `,
}));

const meta = {
  title: "Design System/Data Display/Tabs",
  component: Tabs,
  argTypes: {
    tabs: {
      description: "Tabs object list.",
      table: {
        type: {
          summary: `TabProps[]`,
          detail: `
            TabProps extends ChakraTabProps {
            header: string | ReactNode;
            content: string | ReactNode;
          }`,
        },
      },
      control: {
        type: "object",
      },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A7922",
    },
  },
  args: {
    tabs,
  },
} as Meta<typeof Tabs>;
export default meta;

const Template: StoryFn<typeof Tabs> = (args) => <Tabs {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const TableTabs = Template.bind({});
TableTabs.args = {
  variant: "table",
};
