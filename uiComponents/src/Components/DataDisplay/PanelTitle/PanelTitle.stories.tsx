import React from "react";
import type { Meta, StoryFn } from "@storybook/react";
import type { PanelTitleProps } from "@Components/DataDisplay/PanelTitle";
import { PanelTitle } from "@Components/DataDisplay/PanelTitle";

const props: PanelTitleProps = {
  title: "Panel Title",
};

export default {
  title: "Design System/Data Display/PanelTitle",
  component: PanelTitle,
  args: {},
  parameters: {
    docs: {},
  },
} as Meta<typeof PanelTitle>;

const Template: StoryFn<typeof PanelTitle> = (args) => <PanelTitle {...args} />;

export const PanelTitleWithBorderBottom = Template.bind({});

PanelTitleWithBorderBottom.args = {
  ...props,
};
