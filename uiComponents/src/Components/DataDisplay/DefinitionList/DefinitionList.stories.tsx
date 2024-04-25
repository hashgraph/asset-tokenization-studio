import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { DefinitionList, DefinitionListGrid } from "./index";
import { Link } from "@Components/Interaction/Link";

const items = [
  {
    title: "List Title",
    description: "List Description",
  },
  {
    title: "List Title",
    description: "List Description",
  },
  {
    title: "List Title",
    description: "List Description",
    canCopy: true,
  },
];

const meta = {
  title: "Design System/Data Display/DefinitionList",
  component: DefinitionList,
  argTypes: {},
  parameters: {
    docs: {},
  },
  args: {
    title: "List Title",
    items,
    isLoading: false,
  },
} as Meta<typeof DefinitionList>;
export default meta;

const Template: StoryFn<typeof DefinitionList> = (args) => (
  <DefinitionList {...args} />
);

const GridTemplate: StoryFn<typeof DefinitionList> = (args) => (
  <DefinitionListGrid columns={2}>
    <DefinitionList {...args} />
    <DefinitionList {...args} />
  </DefinitionListGrid>
);

export const Default = Template.bind({});
Default.args = {};

export const WithIsLoading = Template.bind({});
WithIsLoading.args = {
  isLoading: true,
};

export const WithIsLoadingItem = Template.bind({});
WithIsLoadingItem.args = {
  items: [
    {
      title: "List Title",
      description: "List Description",
      isLoading: true,
    },
    ...items,
  ],
};

export const GridDefinitionList = GridTemplate.bind({});
GridDefinitionList.args = {};

export const WithCustomDescriptions = Template.bind({});
WithCustomDescriptions.args = {
  items: [
    {
      title: "List Title",
      description: "List Description",
    },
    {
      title: "With link",
      description: <Link href="/">link</Link>,
      valueToCopy: "custom value copied",
      canCopy: true,
    },
    {
      title: "List Title",
      description: "List Description",
      canCopy: true,
    },
  ],
};

export const WithoutTitle = Template.bind({});
WithoutTitle.args = {
  title: undefined,
};
