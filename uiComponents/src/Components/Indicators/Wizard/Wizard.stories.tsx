import React from "react";
import type { Meta, StoryFn } from "@storybook/react";
import type { WizardSteps } from "./Wizard";
import { Wizard } from "./Wizard";
import { useStepContext, useSteps } from "@Components/Indicators/Stepper";
import { Button } from "@Components/Interaction/Button";
import { Flex } from "@chakra-ui/react";

const Step = ({ title }: { title: string }) => {
  const step = useStepContext();

  return (
    <>
      <div>{title}</div>
      <Flex gap={2}>
        <Button isDisabled={step.isFirst} onClick={step.goToPrevious}>
          prev
        </Button>
        <Button isDisabled={step.isLast} onClick={step.goToNext}>
          next
        </Button>
      </Flex>
    </>
  );
};
const stepsData: WizardSteps = [
  {
    title: "First",
    description:
      "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    content: <Step title="First" />,
  },
  {
    title: "Second",
    description: "Contact Info ",
    content: <Step title="second" />,
  },
  {
    title: "Third",
    description:
      "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    content: <Step title="third" />,
  },
  {
    title: "Four",
    description:
      "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    content: <Step title="four" />,
  },
  {
    title: "five",
    description:
      "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    content: <Step title="five" />,
  },
  {
    title: "six",
    description:
      "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    content: <Step title="six" />,
  },
];

export default {
  title: "Design System/Indicators/Wizard",
  component: Wizard,
  args: {
    steps: stepsData,
  },
} as Meta<typeof Wizard>;

const Template: StoryFn<typeof Wizard> = (args) => {
  const steps = useSteps();
  return <Wizard {...steps} {...stepsData} {...args} />;
};
export const Default = Template.bind({});
