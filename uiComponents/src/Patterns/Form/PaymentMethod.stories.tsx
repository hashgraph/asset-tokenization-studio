import {
  Box,
  Center,
  Divider,
  Flex,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Icon, CustomIcon } from "@/Components/Foundations/Icon";
import type { StoryFn } from "@storybook/react";
import React from "react";
import { Clock, NotePencil, Question } from "@phosphor-icons/react";
const palmLogo = require("../assets/Brand.png");

const meta = {
  title: "Patterns/Form Patterns/Payment Method",
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

const TemplatePaymentMethod: StoryFn<typeof Box> = () => {
  // The Card Info Component
  const CardView = () => (
    <Flex
      borderWidth={1}
      borderColor="neutral.300"
      w="full"
      py={4}
      px={5}
      alignItems="center"
    >
      <Center w={12} h={12} bg="neutral.100" borderRadius="50%" mr={4}>
        <CustomIcon name="MasterCardColor" w={6} h={6} />
      </Center>
      <Box>
        <Text fontSize="xs">Default</Text>
        <Text fontSize="sm">•••••••••••• 2358</Text>
        <Text fontSize="xs">Exp 06/24</Text>
      </Box>
      <Icon ml="auto" h={6} w={6} as={NotePencil} />
    </Flex>
  );

  return (
    <Box w={481} color="neutral.700">
      <Flex alignItems="center" mb={2}>
        <Text fontSize="xs" as="b" lineHeight={4} letterSpacing="0.01em">
          PAYMENT METHOD
        </Text>
      </Flex>
      <CardView />
      <Divider my={8} />
      <Box>
        <Flex alignItems="center" mb={3}>
          <Text fontSize="lg">Subtotal</Text>
          <Text fontSize="md" ml="auto">
            $300.00
          </Text>
        </Flex>
        <Flex alignItems="center" mb={3}>
          <Text fontSize="md" display="flex" alignItems="center">
            Service Fees
            <Icon ml={1} as={Question} />
          </Text>
          <Text fontSize="md" ml="auto">
            $300.00
          </Text>
        </Flex>
        <Flex alignItems="center" mb={8}>
          <Text fontSize="lg">Total</Text>
          <Text
            as="b"
            fontSize="2xl"
            ml="auto"
            display="flex"
            alignItems="center"
          >
            $300.00
            <Text fontSize="sm" as="b" ml={1}>
              USD
            </Text>
          </Text>
        </Flex>
      </Box>
      <Center>
        <Icon h={6} w={6} mr={1} as={Clock} />
        <Text>
          Your NFT is being held for{" "}
          <Text fontSize="md" as="span" color="green.500">
            5:00:00 minutes
          </Text>
        </Text>
      </Center>
      <HStack spacing={4} mt={6}>
        <Button size="lg" variant="outline" w="full">
          Cancel
        </Button>
        <Button size="lg" variant="solid" w="full">
          Continue
        </Button>
      </HStack>
      <Flex mt={4}>
        <Image src={palmLogo} alt="Palm Logo" w={20} h={10} mr={4} />
        <Text fontSize="10px">
          By placing your order, you agree to Palm NFT Studio’s Terms of Service
          and Privacy Policy and acknowledge that Palm NFT Studio is the
          authorized seller. Check out our FAQs for more details.
        </Text>
      </Flex>
    </Box>
  );
};

export const PaymentMethod = TemplatePaymentMethod.bind({});
