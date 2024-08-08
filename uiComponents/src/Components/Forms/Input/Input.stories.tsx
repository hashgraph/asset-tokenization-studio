import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { Input, InputIcon } from "./Input";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { omit as _omit } from "lodash";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";

import { Button } from "@Components/Interaction/Button";
import { linkTo } from "@storybook/addon-links";
import { Alert } from "@Components/Overlay/Alert";
import { Envelope } from "@phosphor-icons/react";
import { BasePlatformTheme } from "@/Theme";
import { addonRightInput, inputArgTypes } from "@/storiesUtils";

const meta = {
  title: "Design System/Forms/Input",
  component: Input,
  args: {
    variant: "outline",
    label: "Label",
    placeholder: "Placeholder",
  },
  argTypes: inputArgTypes,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=CYTpHR0mFDJMv5GO-4",
    },
    docs: {},
  },
} as Meta<typeof Input>;
export default meta;

const Template: StoryFn<typeof Input> = (args) => (
  <Input variant="random" {...args} />
);

export const Small = Template.bind({});
Small.args = {
  size: "sm",
};

export const Medium = Template.bind({});
Medium.args = {
  size: "md",
};

export const Large = Template.bind({});
Large.args = {
  size: "lg",
};

export const ExtraLarge = () => (
  <Button onClick={linkTo("Design System/Forms/Textarea")}>
    Check out the TextArea component stories
  </Button>
);

export const ControlledInput = () => (
  <Button onClick={linkTo("Design System/Forms/Controllers/InputController")}>
    Check out the InputController component stories
  </Button>
);

export const WithIconLeft = Template.bind({});

WithIconLeft.args = {
  addonLeft: <InputIcon icon={<PhosphorIcon as={Envelope} />} />,
};

export const WithInformativeIconRight = Template.bind({});

WithInformativeIconRight.args = {
  addonRight: addonRightInput.OneIcon,
};

export const WithIconButtonRight = Template.bind({});

WithIconButtonRight.args = {
  addonRight: addonRightInput.OneButtonIcon,
};

export const WithTwoIconRight = Template.bind({});

WithTwoIconRight.args = {
  addonRight: addonRightInput.TwoIcon,
};

export const IsDisabled = Template.bind({});

IsDisabled.args = {
  isDisabled: true,
};

export const IsInvalid = Template.bind({});

IsInvalid.args = {
  isInvalid: true,
};

export const ShowRequired = Template.bind({});

ShowRequired.args = {
  isRequired: true,
  showRequired: true,
};

export const IsSuccess = Template.bind({});

IsSuccess.args = {
  isSuccess: true,
};

export const IsClearable = Template.bind({});

IsClearable.args = {
  isClearable: true,
  onClear: () => console.log("Click"),
};

const TemplateNoTheme: StoryFn<typeof Input> = (args) => {
  const originalTheme = BasePlatformTheme;

  //@ts-ignore
  originalTheme.components = _omit(originalTheme.components, "Input");

  return (
    <ChakraProvider theme={extendTheme(originalTheme)}>
      <Alert status="warning" mb={2}>
        This component doesn't have any theme configured.
      </Alert>
      <Input {...args} />
    </ChakraProvider>
  );
};

export const IsInvalidWithDefaultErrorIcon = TemplateNoTheme.bind({});

IsInvalidWithDefaultErrorIcon.args = {
  isInvalid: true,
};

export const withLongPlaceholder = Template.bind({});

withLongPlaceholder.args = {
  placeholder:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
};

export const withTopDescription = Template.bind({});
withTopDescription.args = {
  topDescription: "This is a description",
};

export const withBottomDescription = Template.bind({});
withBottomDescription.args = {
  bottomDescription: "This is a description",
};

export const withSublabel = Template.bind({});
withSublabel.args = {
  subLabel: "This is a sublabel",
};
