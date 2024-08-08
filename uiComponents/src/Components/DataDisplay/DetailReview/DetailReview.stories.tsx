import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { DetailReview } from "./DetailReview";
import { Link } from "@chakra-ui/react";

const meta = {
  title: "Design System/Data Display/DetailReview",
  component: DetailReview,
  argTypes: {},
  parameters: {
    docs: {},
  },
  args: {
    title: "Title",
    value: "This is the description",
  },
} as Meta<typeof DetailReview>;
export default meta;

export const Template: StoryFn<typeof DetailReview> = (args) => (
  <DetailReview {...args} />
);

export const WithCustomComponent: StoryFn<typeof DetailReview> = (args) => (
  <DetailReview title="title" value={<Link>link</Link>} />
);

export const WithIsLoading = Template.bind({});
WithIsLoading.args = {
  isLoading: true,
};
