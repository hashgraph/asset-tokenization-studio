import React from "react";
import { Box, Heading, Link, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Input } from "@Components/Forms/Input";
import { CustomIcon } from "@/Components/Foundations/Icon";
import { ToastConfigurator, useToast } from "@Components/Overlay/Toast";

import type { DataLoginForm } from "@/Patterns/Form/utils";
import { submitLoginForm } from "@/Patterns/Form/utils";
import type { StoryFn } from "@storybook/react";
import { ToastComponent } from "./helpers";
import { useForm } from "react-hook-form";

const meta = {
  title: "Patterns/Form Patterns/Login",
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

const TemplateLogin: StoryFn<typeof Box> = () => {
  const toast = useToast();

  const [isLoading, setIsLoading] = React.useState(false);

  const { handleSubmit, register } = useForm<DataLoginForm>();

  const onSubmit = (data: DataLoginForm) => {
    setIsLoading(true);
    submitLoginForm(data)
      .then((_) => {
        toast.show({
          status: "success",
          title: "Login Success",
          description: "You have successfully logged in",
        });
      })
      .catch((_) => {
        toast.show({
          status: "error",
          title: "Login Failed",
          description: "Please check your email and password",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      w={481}
      color="neutral.700"
    >
      <Text fontSize="xs" as="b" lineHeight={4} letterSpacing="0.01em">
        WELCOME BACK
      </Text>
      <Heading size="lg" color="neutral.900" mt={4}>
        Login
      </Heading>
      <Input
        disabled={isLoading}
        label="email"
        placeholder="email"
        size="md"
        variant="outline"
        mb={4}
        mt={8}
        {...register("email")}
      />
      <Input
        disabled={isLoading}
        label="password"
        placeholder="password"
        type="password"
        size="md"
        variant="outline"
        addonRight={<CustomIcon name="EyeOff" w={6} h={6} />}
        {...register("password")}
      />
      <Text fontSize="sm" mt={4} mb={12} textDecor="underline">
        <Link>Forgot password?</Link>
      </Text>
      <Button isLoading={isLoading} type="submit" size="lg" w="100%">
        Login
      </Button>
      <Text fontSize="sm" mt={8}>
        Are you a New user? <Link color="blue.500">Get Signed up</Link>
      </Text>
      <ToastConfigurator component={ToastComponent} />
    </Box>
  );
};

export const Login = TemplateLogin.bind({});
