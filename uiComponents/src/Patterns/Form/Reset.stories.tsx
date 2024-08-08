import { Box, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Checkbox } from "@Components/Forms/Checkbox";
import { Input } from "@Components/Forms/Input";
import { CustomIcon } from "@/Components/Foundations/Icon";

import type { StoryFn } from "@storybook/react";
import React from "react";

const meta = {
  title: "Patterns/Form Patterns/Reset Password",
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

const TemplateSignup: StoryFn<typeof Box> = () => (
  <Box w={481} color="neutral.700">
    <Heading size="lg" color="neutral.900" mb={8}>
      Reset your Password?{" "}
    </Heading>
    <Input
      label="password"
      placeholder="password"
      type="password"
      size="md"
      variant="outline"
      addonRight={<CustomIcon name="EyeOff" w={6} h={6} />}
    />
    <Stack my={6} spacing={4}>
      <Checkbox size="sm" variant="circle">
        Must be 8 or more characters
      </Checkbox>
      <Checkbox size="sm" variant="circle">
        Must include a special number or character
      </Checkbox>
    </Stack>
    <Input
      label="retype password"
      placeholder="retype password"
      size="md"
      variant="outline"
      addonRight={<CustomIcon name="EyeOff" w={6} h={6} />}
    />
    <Button size="lg" w="100%" my={8}>
      Reset Password
    </Button>
    <Text fontSize="sm" mb={8}>
      Didn’t receive an email from us?{" "}
      <Link color="blue.500">Resend email.</Link>
    </Text>
  </Box>
);

export const ResetPassword = TemplateSignup.bind({});
