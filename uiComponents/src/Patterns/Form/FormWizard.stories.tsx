import { Button } from "@Components/Interaction/Button";
import { SelectController } from "@Components/Forms/Controllers";
import { Text } from "@/Components/Foundations/Text";
import { useStepContext, useSteps } from "@Components/Indicators/Stepper";
import { Wizard } from "@Components/Indicators/Wizard";
import type { Box } from "@chakra-ui/react";
import type { StoryFn } from "@storybook/react";

import React from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

const meta = {
  title: "Patterns/Form Patterns/form wizard",
  argTypes: {},
  parameters: {
    previewTabs: {
      canvas: {
        hidden: true,
      },
    },
    viewMode: "docs",
    docs: {},
  },
  args: {},
};
export default meta;

const Step1 = () => {
  const { control } = useFormContext();
  const { goToNext } = useStepContext();

  return (
    <>
      <SelectController
        id="field"
        control={control}
        setsFullOption
        options={[
          { label: "value 1", value: "VAL-1" },
          { label: "value 2", value: "VAL-2" },
        ]}
      />
      <Button onClick={goToNext}>next</Button>
    </>
  );
};
const Step2 = () => {
  const { getValues } = useFormContext();
  const { goToPrevious } = useStepContext();

  return (
    <>
      <Text>{getValues("field").label}</Text>
      <Button onClick={goToPrevious}>prev</Button>
    </>
  );
};

const Template: StoryFn<typeof Box> = () => {
  const form = useForm();
  const steps = useSteps();
  return (
    <FormProvider {...form}>
      <Wizard
        {...steps}
        steps={[
          { title: "step 1", content: <Step1 /> },
          { title: "step2", content: <Step2 /> },
        ]}
      ></Wizard>
    </FormProvider>
  );
};
export const Default = Template.bind({});
