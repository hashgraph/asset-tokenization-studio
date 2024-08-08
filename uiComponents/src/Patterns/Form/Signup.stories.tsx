import { Box, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Checkbox } from "@Components/Forms/Checkbox";
import { Input } from "@Components/Forms/Input";
import { CustomIcon } from "@/Components/Foundations/Icon";

import type { StoryFn } from "@storybook/react";
import React from "react";
const recaptchaImg = require("../assets/reCAPTCHA.png");

const meta = {
  title: "Patterns/Form Patterns/Sign up",
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
    <Text fontSize="xs" as="b" lineHeight={4} letterSpacing="0.01em">
      REGISTER TO REDEEM YOUR FREE NFT
    </Text>
    <Heading size="lg" color="neutral.900" mt={4}>
      Sign Up
    </Heading>
    <Input
      label="email"
      placeholder="email"
      size="md"
      variant="outline"
      mt={10}
    />
    <Input
      label="username"
      placeholder="username"
      size="md"
      variant="outline"
      my={4}
    />
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
    <Stack my={8} spacing={4}>
      <Checkbox size="sm">
        I accept the Terms and Conditions & Privacy Policy
      </Checkbox>
      <Checkbox size="sm">
        I want to receive updates, ads and offers from Archie Comics
      </Checkbox>
    </Stack>
    {/* this should not be an image ^^ */}
    <Image w="100%" src={recaptchaImg} alt="recaptcha" />
    <Button size="lg" w="100%" my={8}>
      Sign Up
    </Button>
    <Text fontSize="sm" mb={8}>
      Already have an account? <Link color="blue.500">Login to account</Link>
    </Text>
    <Text fontSize="xs">
      *To withdraw your consent and to learn more about your rights and how to
      exercise them, see Archie Comic’s privacy policy.
    </Text>
  </Box>
);

export const Signup = TemplateSignup.bind({});
