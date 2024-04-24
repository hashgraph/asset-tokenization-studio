import { Box, Heading, Link, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import type { ComponentStory } from "@storybook/react";
import React from "react";

const meta = {
  title: "Patterns/Form Patterns/Verify Email",
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

const TemplateVerify: ComponentStory<typeof Box> = () => (
  <Box w={481} color="neutral.700">
    <Text fontSize="xs" as="b" lineHeight={4} letterSpacing="0.01em">
      ALMOST THERE
    </Text>
    <Heading size="lg" color="neutral.900" mt={4}>
      Verify your Email
    </Heading>
    <Text fontSize="sm" my={8}>
      Thanks for creating an account! Check your inbox for an email so we can
      verify that it’s you.
    </Text>
    <Button size="lg" w="100%">
      Proceed to Login
    </Button>
    <Text fontSize="sm" my={8}>
      Didn’t receive an email from us?{" "}
      <Link color="blue.500">Resend email.</Link>
    </Text>
  </Box>
);

export const VerifyEmail = TemplateVerify.bind({});
