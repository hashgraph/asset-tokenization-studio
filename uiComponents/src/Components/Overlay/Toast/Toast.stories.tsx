import type { ToastPosition } from "@chakra-ui/react";
import {
  Box,
  Text,
  VStack,
  useColorModeValue,
  Grid,
  GridItem,
  Center,
} from "@chakra-ui/react";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Button } from "@Components/Interaction/Button";

import type { BaseToastOptions, AlertStatus, ToastId } from "./Toast.types";
import { useToast } from "./useToast";

const positions: ToastPosition[] = [
  "top-left",
  "top",
  "top-right",
  "bottom-right",
  "bottom",
  "bottom-left",
];

export const DemoToast = (props: BaseToastOptions) => {
  const toastIdRef = React.useRef<ToastId>();

  const toast = useToast();

  function addToast(params?: BaseToastOptions) {
    toastIdRef.current = toast.show({
      ...props,
      ...params,
    });
  }
  function addAnotherToast(position: BaseToastOptions["position"]) {
    toastIdRef.current = toast.show({
      ...props,
      position,
      render: (renderProps) => (
        <Card
          {...props}
          status="success"
          onClose={() => {
            toast.close(renderProps.id!);
          }}
        />
      ),
    });
  }

  function close() {
    if (props.isClosable && toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
  }

  function closeAll() {
    if (props.isClosable) {
      toast.closeAll();
    }
  }

  return (
    <Grid templateColumns="repeat(7, 1fr)" gap={4} padding={5}>
      <GridItem />

      {positions.map((position) => (
        <GridItem>
          <Text>{position}</Text>
        </GridItem>
      ))}

      <GridItem>
        <Text>Error</Text>
      </GridItem>

      {positions.map((position) => (
        <GridItem>
          <Button
            width="90%"
            variant="primary"
            status="error"
            onClick={() =>
              addToast({
                ...props,
                status: "error",
                position: position,
              })
            }
          >
            Show error ({position})
          </Button>
        </GridItem>
      ))}

      <GridItem>
        <Text>Info</Text>
      </GridItem>

      {positions.map((position) => (
        <GridItem>
          <Button
            width="90%"
            variant="secondary"
            onClick={() =>
              addToast({ ...props, status: "info", position: position })
            }
          >
            Show info ({position})
          </Button>
        </GridItem>
      ))}

      <GridItem>
        <Text>Success</Text>
      </GridItem>

      {positions.map((position) => (
        <GridItem>
          <Button
            width="90%"
            variant="primary"
            onClick={() =>
              addToast({ ...props, status: "success", position: position })
            }
          >
            Show success ({position})
          </Button>
        </GridItem>
      ))}

      <GridItem>
        <Text>Warning</Text>
      </GridItem>

      {positions.map((position) => (
        <GridItem>
          <Button
            width="90%"
            variant="primary"
            status="warning"
            onClick={() =>
              addToast({ ...props, status: "warning", position: position })
            }
          >
            Show warning ({position})
          </Button>
        </GridItem>
      ))}

      <GridItem>
        <Text>Loading</Text>
      </GridItem>

      {positions.map((position) => (
        <GridItem>
          <Button
            width="90%"
            variant="secondary"
            onClick={() =>
              addToast({ ...props, status: "loading", position: position })
            }
          >
            Show loading ({position})
          </Button>
        </GridItem>
      ))}

      <GridItem>
        <Text>Custom</Text>
      </GridItem>

      {positions.map((position) => (
        <GridItem>
          <Button
            width="90%"
            variant="tertiary"
            onClick={() => addAnotherToast(position)}
          >
            Show Custom ({position})
          </Button>
        </GridItem>
      ))}

      <Button width={40} variant="outline" color="teal" onClick={close}>
        Close latest
      </Button>
      <Button width={40} variant="outline" color="teal" onClick={closeAll}>
        Close all
      </Button>
    </Grid>
  );
};

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center", lg: "flex-start" }}
      borderColor={useColorModeValue("neutral.200", "neutral.500")}
      borderRadius={"xl"}
    >
      {children}
    </Box>
  );
}

function Card({
  status,
  onClose,
  description = "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
  title,
  isClosable = true,
}: {
  status: AlertStatus;
  onClose(): void;
  description?: any;
  title?: string;
  isClosable?: boolean;
}) {
  return (
    <CardWrapper>
      <Center
        py={4}
        px={12}
        flexDirection="column"
        backgroundColor={useColorModeValue("neutral", "neutral.700")}
        borderTop="solid 3px"
        borderTopColor={useColorModeValue(`${status}.500`, `${status}.200`)}
      >
        <Text mb={5} fontWeight="700" fontSize="3xl">
          {title}
        </Text>
        <Text fontWeight="500" fontSize="2xl">
          {description}
        </Text>
      </Center>
      <VStack
        bg={useColorModeValue("neutral.50", "neutral.700")}
        py={4}
        borderBottomRadius={"xl"}
      >
        <Box w="80%" pt={7}>
          <Button
            width={15}
            onClick={isClosable ? onClose : undefined}
            w="full"
            variant="primary"
            status={status}
          >
            Close
          </Button>
        </Box>
      </VStack>
    </CardWrapper>
  );
}

const meta = {
  title: "Design System/Overlay/Toast",
  component: DemoToast,
  argTypes: {
    title: {
      control: { type: "text", required: true },
      description:
        "A required string that indicates the title of the Toast, which is displayed at the top of the Toast.",
    },
    status: {
      options: ["info", "warning", "error", "success"],
      control: { type: "select", required: true },
      description:
        "A required string that indicates the status of the Toast, which determines the visual style to be used.",
    },
    description: {
      control: { type: "text" },
      description:
        "A required string that indicates the title of the Toast, which is displayed at the top of the Toast.",
    },
    variant: {
      options: ["subtle", "solid", "leftAccent", "topAccent"],
      control: { type: "select" },
      description: "Determines the style of the toast",
    },
    isClosable: {
      control: { type: "boolean" },
      description: "Determines if the toast is closable",
      defaultValue: false,
    },
    onClose: {
      description:
        "An optional function that will be called when the Toast is closed.",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10080",
    },
  },
  args: {
    description: "This is a description",
    title: "Title",
    variant: "subtle",
    onClose: undefined,
    isClosable: true,
  },
} as Meta<typeof DemoToast>;
export default meta;

const Template: StoryFn<typeof DemoToast> = (args) => <DemoToast {...args} />;

export const Line = Template.bind({});
Line.args = {
  variant: "subtle",
};
