import { Box, Heading, Image } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Input } from "@Components/Forms/Input";

import type { StoryFn } from "@storybook/react";
import { onSubmit, ToastComponent } from "./helpers";
import React from "react";
import { ToastConfigurator } from "@Components/Overlay/Toast";

const recaptchaImg = require("../assets/reCAPTCHA.png");

const meta = {
  title: "Patterns/Form Patterns/Forgot Password",
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

const TemplateForgot: StoryFn<typeof Box> = () => {
  const [inputValue, setInputValue] = React.useState("");

  return (
    <Box w={481} color="neutral.700">
      <ToastConfigurator component={ToastComponent} />
      <Heading size="lg" color="neutral.900" mt={4}>
        Forgot your Password?
      </Heading>
      <Input
        label="email"
        placeholder="email"
        size="md"
        variant="outline"
        mt={10}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Image w="100%" src={recaptchaImg} alt="recaptcha" my={8} />
      <Button
        size="lg"
        w="100%"
        onClick={() => {
          onSubmit(inputValue);
        }}
      >
        Continue
      </Button>
    </Box>
  );
};

export const ForgotPassword = TemplateForgot.bind({});
