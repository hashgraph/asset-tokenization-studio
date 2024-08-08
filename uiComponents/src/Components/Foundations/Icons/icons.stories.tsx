import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { Box, Divider, Grid, VStack } from "@chakra-ui/react";
import type { StoryFn } from "@storybook/react";
import React from "react";
import { Bluetooth } from "@phosphor-icons/react";

const meta = {
  title: "Design System/Foundations/Icons",
  argTypes: {},
  args: {},
  parameters: {},
};
export default meta;

export const Icons: StoryFn = () => {
  const sizes = ["xxs", "xs", "sm", "md"];

  return (
    <Box mt={8}>
      <Grid templateColumns={"1fr 1fr 1fr 1fr"}>
        {sizes.map((size) => {
          return (
            <VStack alignItems={"flex-start"}>
              <Text
                textStyle={"ElementsRegularMD"}
                mb={1}
                color={"neutral.700"}
              >
                {size.toUpperCase()}
              </Text>
              <Divider style={{ marginBottom: "10px" }} />
              <PhosphorIcon as={Bluetooth} size={size} />
            </VStack>
          );
        })}
      </Grid>
    </Box>
  );
};
