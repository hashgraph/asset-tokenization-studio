import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { SearchInputController } from "./SearchInputController";
import { useForm } from "react-hook-form";

const meta = {
  title: "Design System/Forms/Controllers/SearchInputController",
  component: SearchInputController,
  args: {
    id: "search",
    label: "Label",
    placeholder: "Placeholder",
    onSearch: (value) => console.log(`Searching... ${value}`),
  },
  argTypes: {},
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4",
    },
    docs: {},
  },
} as Meta<typeof SearchInputController>;
export default meta;

const Template: StoryFn<typeof SearchInputController> = (args) => {
  const form = useForm({ mode: "onChange" });
  return <SearchInputController {...args} control={form.control} />;
};

export const Default = Template.bind({});

export const MinInputSearchCustom = Template.bind({});
MinInputSearchCustom.args = {
  placeholder: "Introduce 5 chars to search",
  minSearchLength: 5,
};
