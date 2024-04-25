import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Box, Flex, Grid, GridItem, Stack, Text } from "@chakra-ui/react";
import { Input, InputIcon } from "@Components/Forms/Input";
import { Select } from "@Components/Forms/Select";
import { Icon } from "@/Components/Foundations/Icon";

import type { StoryFn } from "@storybook/react";
import { Question } from "@phosphor-icons/react";
import React from "react";

const meta = {
  title: "Patterns/Form Patterns/Billing Information",
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

const TemplateBillingInformation: StoryFn<typeof Box> = () => (
  <Box w={481} color="neutral.700">
    <Flex alignItems="center" mb={4}>
      <Text fontSize="xs" as="b" lineHeight={4} letterSpacing="0.01em">
        BILLING INFORMATION
      </Text>
      <Icon as={Question} ml={2} />
    </Flex>
    <Stack spacing={3}>
      <Select
        label="Country"
        options={[
          { label: "option 1", value: 1 },
          { label: "option 2", value: 2 },
        ]}
        placeholder="Select Country"
      />
      <Input
        label="First Name"
        placeholder="First Name"
        addonRight={<InputIcon icon={<PhosphorIcon as={Question} />} />}
      />
      <Input
        label="Last Name"
        placeholder="Last Name"
        addonRight={<InputIcon icon={<PhosphorIcon as={Question} />} />}
      />
      <Input
        label="Address 1"
        placeholder="Address 1"
        addonRight={<InputIcon icon={<PhosphorIcon as={Question} />} />}
      />
      <Input
        label="Address 2 (optional)"
        placeholder="Address 2 (optional)"
        addonRight={<InputIcon icon={<PhosphorIcon as={Question} />} />}
      />
      <Input label="City" placeholder="City" />
      <Grid templateColumns="61% 1fr" gap={6}>
        <GridItem>
          <Select options={[]} placeholder="State" />
        </GridItem>
        <GridItem>
          <Input
            label="Zip Code"
            placeholder="Zip Code"
            addonRight={<InputIcon icon={<PhosphorIcon as={Question} />} />}
          />
        </GridItem>
      </Grid>
    </Stack>
  </Box>
);

export const BillingInformation = TemplateBillingInformation.bind({});
