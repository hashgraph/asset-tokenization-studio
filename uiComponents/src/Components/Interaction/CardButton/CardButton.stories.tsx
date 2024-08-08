import type { Meta, StoryFn } from "@storybook/react";
import { CardButton } from "./CardButton";
import React, { useState } from "react";
import { iconLabels, iconList, mappedIcons } from "@/storiesUtils";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Activity, Airplane, Circle, X } from "@phosphor-icons/react";
import { Center } from "@chakra-ui/react";

const meta = {
  title: "Design System/Interaction/CardButton",
  component: CardButton,
  argTypes: {
    text: {
      description: "Enter text of card button",
    },
    icon: {
      options: iconList,
      control: {
        type: "select",
        labels: iconLabels,
        required: false,
      },
      mapping: mappedIcons,
      description: "Icon to be displayed on the left side of the button",
    },
  },
  args: {
    icon: <PhosphorIcon as={Activity} />,
  },
} as Meta<typeof CardButton>;
export default meta;

const Template: StoryFn<typeof CardButton> = (args) => {
  return (
    <Center>
      <CardButton {...args} />
    </Center>
  );
};

const TemplateGroup: StoryFn<typeof CardButton> = (args) => {
  const [cardSelected, setCardSelected] = useState<number>(0);

  const options = [
    {
      text: "Card button 1",
      icon: <PhosphorIcon as={Airplane} />,
    },
    {
      text: "Card button 2",
      icon: <PhosphorIcon as={Circle} />,
    },
    {
      text: "Card button 3",
      icon: <PhosphorIcon as={X} />,
    },
  ];

  return (
    <Center gap={4}>
      {options.map((item, index) => {
        const isSelected = cardSelected === index;

        return (
          <CardButton
            onClick={() => setCardSelected(index)}
            isSelected={isSelected}
            {...item}
          />
        );
      })}
    </Center>
  );
};

export const Default = Template.bind({});
Default.args = {
  text: "Button text",
};

export const WithLongText = Template.bind({});
WithLongText.args = {
  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
};

export const disabled = Template.bind({});
disabled.args = {
  text: "Button text",
  isDisabled: true,
};

export const selected = Template.bind({});
selected.args = {
  text: "Button text",
  isSelected: true,
};

export const group = TemplateGroup.bind({});
