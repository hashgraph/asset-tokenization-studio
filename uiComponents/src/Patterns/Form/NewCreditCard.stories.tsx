import {
  Box,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  HStack,
  Text,
} from "@chakra-ui/react";
import { Input } from "@Components/Forms/Input";
import { Icon } from "@/Components/Foundations/Icon";

import type { StoryFn } from "@storybook/react";
import React from "react";
import { CreditCard } from "@phosphor-icons/react";

const meta = {
  title: "Patterns/Form Patterns/New Credit Card",
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

const TemplateNewCreditCard: StoryFn<typeof Box> = () => (
  <Box w={481} color="neutral.700">
    <Flex alignItems="center" mb={2}>
      <Text fontSize="xs" as="b" lineHeight={4} letterSpacing="0.01em">
        NEW CREDIT CARD
      </Text>
    </Flex>
    <Input
      label="Name on Card"
      placeholder="Name on Card"
      size="md"
      variant="outline"
      my={6}
    />
    <Input
      label="Card Number"
      placeholder="Card Number"
      size="md"
      variant="outline"
      addonLeft={<Icon as={CreditCard} w={6} h={6} />}
    />
    <Grid templateColumns="repeat(3, 1fr)" gap={6} my={6}>
      <GridItem>
        <Input
          label="Exp MM / YY"
          placeholder="Exp MM / YY"
          size="md"
          variant="outline"
        />
      </GridItem>
      <GridItem>
        <Input label="CVV" placeholder="CVV" size="md" variant="outline" />
      </GridItem>
    </Grid>
    <HStack spacing={8}>
      <Checkbox size="sm">Save Credit Card</Checkbox>
      <Checkbox size="sm">Set as Primary Payment Method</Checkbox>
    </HStack>
  </Box>
);

export const NewCreditCard = TemplateNewCreditCard.bind({});
