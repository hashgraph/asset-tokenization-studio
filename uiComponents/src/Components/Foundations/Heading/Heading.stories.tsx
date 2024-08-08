import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { ThemeStoryWrapper } from "../../story-config";
import { Heading } from "./Heading";
import { Title } from "@storybook/addon-docs";
import { Box, Grid, GridItem, Link } from "@chakra-ui/react";
import { textStyles } from "@/Theme/textStyles";

const headingTextStyles = Object.keys(textStyles).filter((textStyle) =>
  textStyle.startsWith("Heading")
);

const meta = {
  title: "Design System/Foundations/Heading",
  component: Heading,
  argTypes: {
    textStyle: {
      options: headingTextStyles,
      control: { type: "select" },
      description:
        "The textStyle that the heading has. Must be defined in the theme in the theme key `textStyles` ",
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
            <Title>Heading Text styles</Title>

            <Grid
              templateRows="repeat(4, 1fr)"
              gap={10}
              mt={10}
              alignItems="center"
              gridAutoFlow={"column"}
              justifyItems="center"
              bg="neutral"
            >
              {headingTextStyles.map((name) => (
                <GridItem key={name}>
                  <Heading textStyle={name}>{name}</Heading>
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
} as Meta<typeof Heading>;
export default meta;

const Template: StoryFn<typeof Heading> = (args) => (
  <Heading {...args}>Title</Heading>
);

export const Default = Template.bind({});
Default.args = {};
