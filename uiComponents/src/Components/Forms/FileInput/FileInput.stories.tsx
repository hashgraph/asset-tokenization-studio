import type { Meta, StoryFn } from "@storybook/react";
import { FileInput } from "./FileInput";
import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { FileCard } from "@Components/DataDisplay/FileCard";
import { linkTo } from "@storybook/addon-links";
import { Button } from "@Components/Interaction/Button";

const meta = {
  title: "Design System/Forms/FileInput",
  component: FileInput,
  argTypes: {},
  args: {},
  parameters: {},
} as Meta<typeof FileInput>;
export default meta;

const Template: StoryFn<typeof FileInput> = (args) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (fileSelected: File) => {
    setFile(fileSelected);
  };

  return (
    <Box w="full">
      <FileInput {...args} onChange={handleFile} />
      <Box w="full" mt={5}>
        {file && <FileCard file={file} onRemove={() => setFile(null)} />}
      </Box>
    </Box>
  );
};

export const Default = Template.bind({});
Default.args = {};

export const OnlyPDFFile = Template.bind({});
OnlyPDFFile.args = {
  acceptedFileTypes: {
    "application/pdf": [".pdf"],
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  isDisabled: true,
};

export const Invalid = Template.bind({});
Invalid.args = {
  isInvalid: true,
};

export const FileInputController = () => (
  <Button
    onClick={linkTo("Design System/Forms/Controllers/FileInputController")}
  >
    Check out the FileInputController component Stories
  </Button>
);
