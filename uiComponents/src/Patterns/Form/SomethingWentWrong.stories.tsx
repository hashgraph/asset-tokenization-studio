import type { Box } from "@chakra-ui/react";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";

import type { StoryFn } from "@storybook/react";
import React from "react";

const meta = {
  title: "Patterns/Form Patterns/Something Went Wrong",
  argTypes: {},
  parameters: {
    previewTabs: {
      canvas: {
        hidden: true,
      },
    },
    viewMode: "docs",
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1496%3A27397",
    },
    docs: {},
  },
  args: {},
};
export default meta;

const TemplateSWW: StoryFn<typeof Box> = () => (
  <Flex w={481} color="neutral.700" flexDir="column" alignItems="center">
    <Heading size="lg" color="neutral.900" mb={4}>
      Something Went Wrong
    </Heading>
    <Text>This link has expired. Would you like to send a new one?</Text>
    <Button size="lg" my={8}>
      Re-Send Confirmation
    </Button>
  </Flex>
);

export const SomethingWentWrong = TemplateSWW.bind({});
