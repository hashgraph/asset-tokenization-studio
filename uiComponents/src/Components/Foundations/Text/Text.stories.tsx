import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { ThemeStoryWrapper } from "../../story-config";
import { Text } from "./Text";
import { Title, Subtitle } from "@storybook/addon-docs";
import { Box, Divider, Grid, GridItem, Link } from "@chakra-ui/react";
import { textStyles } from "@/Theme/textStyles";

const bodyTextStyles = Object.keys(textStyles).filter((textStyle) =>
  textStyle.startsWith("Body")
);

const elementTextStyles = Object.keys(textStyles).filter((textStyle) =>
  textStyle.startsWith("Elements")
);

const meta = {
  title: "Design System/Foundations/Text",
  component: Text,
  argTypes: {
    textStyle: {
      options: [...bodyTextStyles, ...elementTextStyles],
      control: { type: "select" },
      description:
        "The textStyle that the text has. Must be defined in the theme in the theme key `textStyles` ",
    },
    size: {
      description:
        "The size of the text. We recommend using `textStyle` instead. ",
    },
    variant: {
      description:
        "The variant of the text. Must be defined in the theme inside `Text` component.",
    },
  },
  parameters: {
    docs: {
      page: () => (
        <ThemeStoryWrapper>
          <>
            <Title>Text styles</Title>

            <Box my={10}>
              <Subtitle>Body Text</Subtitle>
            </Box>

            <Grid
              templateRows="repeat(4, 1fr)"
              gap={10}
              alignItems="center"
              gridAutoFlow={"column"}
              justifyItems="center"
              bg="neutral"
            >
              {bodyTextStyles.map((name) => (
                <GridItem key={name}>
                  <Text textStyle={name}>{name}</Text>
                </GridItem>
              ))}
            </Grid>

            <Divider my={10} />
            <Box mb={10}>
              <Subtitle>Elements</Subtitle>
            </Box>

            <Grid
              templateRows="repeat(5, 1fr)"
              gap={10}
              alignItems="center"
              gridAutoFlow={"column"}
              justifyItems="center"
              bg="neutral"
              maxW={"2000px"}
              overflowX="scroll"
            >
              {elementTextStyles.map((name) => (
                <GridItem key={name}>
                  <Text textStyle={name}>{name}</Text>
                </GridItem>
              ))}
            </Grid>
            <Box mt={10}>
              <Link
                href="https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A20660&t=gryWgf3cMhWIZY1U-4"
                isExternal
              >
                View figma design
              </Link>
            </Box>
          </>
        </ThemeStoryWrapper>
      ),
    },
  },
  args: {},
} as Meta<typeof Text>;
export default meta;

const Template: StoryFn<typeof Text> = (args) => (
  <Text {...args}>Text example</Text>
);

export const Default = Template.bind({});
Default.args = {};
