import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Heading } from "../Heading";
import { MarkdownText } from "./MarkdownText";

const meta = {
  title: "Design System/Foundations/MarkdownText",
  component: MarkdownText,
  argTypes: {},
  parameters: {
    docs: {},
  },
  args: {},
} as Meta<typeof MarkdownText>;
export default meta;

const Template: StoryFn<typeof MarkdownText> = (args) => {
  return <MarkdownText {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  children: `
  #### H4 Heading
  #### _H4 Heading Italic_
  `,
};

export const WithCustomTheme = Template.bind({});
WithCustomTheme.args = {
  children: `# h1 Heading 8-) 
  ## h2 Heading
  ### h3 Heading
  #### h4 Heading
  ##### h5 Heading
  ###### h6 Heading
  `,
  theme: {
    h2: (props) => <Heading color="red">{props.children}</Heading>,
  },
};
