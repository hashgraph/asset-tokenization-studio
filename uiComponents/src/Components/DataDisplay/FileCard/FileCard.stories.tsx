import type { Meta, StoryFn } from "@storybook/react";
import { FileCard } from "./FileCard";
import React from "react";

const meta = {
  title: "Design System/Data Display/FileCard",
  component: FileCard,
  argTypes: {
    isInvalid: {
      control: {
        type: "boolean",
      },
    },
  },
  args: {
    file: new File(["99999"], "filename.pdf", { type: "text/html" }),
    onRemove: () => alert("Button clicked!"),
  },
  parameters: {},
} as Meta<typeof FileCard>;
export default meta;

const Template: StoryFn<typeof FileCard> = (args) => <FileCard {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const LongFileName = Template.bind({});
LongFileName.args = {
  file: new File(
    ["99999"],
    "filename_Korem ipsum dolor sit amet, consectetur adipiscing elit.pdf",
    { type: "text/html" }
  ),
};

export const Invalid = Template.bind({});
Invalid.args = {
  isInvalid: true,
};

export const WithIsLoading = Template.bind({});
WithIsLoading.args = {
  isLoading: true,
};
