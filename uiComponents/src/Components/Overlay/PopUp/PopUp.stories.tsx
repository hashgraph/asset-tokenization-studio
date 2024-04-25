import React from "react";
import type { Meta, StoryFn } from "@storybook/react";
import { Button } from "@Components/Interaction/Button";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { Tag } from "../../DataDisplay";
import { Clock } from "@phosphor-icons/react";
import { PopUp, PopUpIcon, PopUpText, ConfirmationPopUp } from "./index";
import { useDisclosure, Flex } from "@chakra-ui/react";
import { iconList, iconLabels, mappedIcons } from "@/storiesUtils";

const Children = () => (
  <>
    <PopUpText type="title" label="Title" />
    <Tag label="Custom content" />
  </>
);

const meta = {
  title: "Design System/Overlay/Popup",
  template: PopUp,
  argTypes: {
    isOpen: {
      control: {
        type: "boolean",
      },
      description: "Toggle to show or hide the popup",
    },
    showOverlay: {
      control: {
        type: "boolean",
      },
    },
    showCloseButton: {
      control: {
        type: "boolean",
      },
    },
    title: {
      description: "Title of the popup",
      control: {
        type: "text",
      },
    },
    description: {
      description: "Description of the popup",
      control: {
        type: "text",
      },
    },
    confirmText: {
      control: {
        type: "text",
      },
      description: "Text of the ok button",
    },
    cancelText: {
      description: "Text of the cancel button",
      control: {
        type: "text",
      },
    },
    size: {
      options: ["xs", "sm", "md", "lg", "xl", "full"],
      control: {
        type: "select",
        required: false,
      },
      description: "Adjust the size of the popup",
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
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?type=design&node-id=2710-33931&t=yFrtXzBtXhWvNqLo-0",
    },
    docs: {},
  },
  args: {
    onCancel: undefined,
    onConfirm: undefined,
    showOverlay: true,
    showCloseButton: true,
    closeOnOverlayClick: true,
    title: "Title",
    description:
      "Here you can enter the pop up text if you need it. Introduce here the information the user needs to keep navigating through the platform.",
    size: "xs",
  },
} as Meta<typeof PopUp>;

const Template: StoryFn<typeof PopUp> = ({
  isOpen: isOpenArgs,
  onClose: onCloseArgs,
  onCancel,
  ...restArgs
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure({
    onClose() {
      onCloseArgs?.();
    },
  });

  const handleCancel = () => {
    onClose();
    onCancel?.();
  };
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100vh"
    >
      <PopUp
        {...restArgs}
        isOpen={isOpen}
        onClose={onClose}
        onCancel={handleCancel}
      />
      <Button onClick={onOpen}>Open</Button>
    </Flex>
  );
};

const ConfirmationTemplate: StoryFn<typeof ConfirmationPopUp> = ({
  isOpen: isOpenArgs,
  onClose: onCloseArgs,
  onConfirm: onConfirmArgs,
  onCancel,
  ...restArgs
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure({
    onClose() {
      onCloseArgs?.();
    },
  });

  const handleCancel = () => {
    onClose();
    onCancel?.();
  };
  const handleConfirm = () => {
    onConfirmArgs?.();
    onClose();
  };

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100vh"
    >
      <ConfirmationPopUp
        {...restArgs}
        isOpen={isOpen}
        onClose={onClose}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
      <Button onClick={onOpen}>Open</Button>
    </Flex>
  );
};

export const Default = Template.bind({});

Default.args = {
  icon: <PhosphorIcon as={Clock} />,
};

export const WithCustomContent = Template.bind({});
WithCustomContent.args = {
  children: <Children />,
};

export const WithOneButton = Template.bind({});
WithOneButton.args = {
  onConfirm: () => {
    alert("Ok");
  },
};

export const WithBothButtons = Template.bind({});
WithBothButtons.args = {
  onConfirm: () => {
    alert("Ok");
  },
  onCancel: () => {
    alert("Cancel");
  },
};

export const WithCustomOrganization = Template.bind({});
WithCustomOrganization.args = {
  children: (
    <>
      <PopUpText type="description" label="Description" />
      <PopUpText type="title" label="title" />
      <PopUpIcon icon={<PhosphorIcon as={Clock} />} />
    </>
  ),
};

export const Confirmation = ConfirmationTemplate.bind({});
Confirmation.args = {
  confirmationText: "Confirm",
  onConfirm: () => {
    alert("Confirmed");
  },
};

export const ConfirmationWithCustomContent = ConfirmationTemplate.bind({});

ConfirmationWithCustomContent.args = {
  confirmationText: "Confirm",
  onConfirm: () => {
    alert("Confirmed");
  },
  children: <Children />,
};

export default meta;
