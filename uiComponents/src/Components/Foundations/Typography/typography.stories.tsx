import { Heading } from "@/Components/Foundations/Heading";
import { Text } from "@/Components/Foundations/Text";
import { Box, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import type { StoryFn } from "@storybook/react";
import React from "react";

const meta = {
  title: "Design System/Foundations/Typography",
  argTypes: {},
  args: {},
  parameters: {},
};
export default meta;

export const Headings: StoryFn = () => {
  const variants = ["Regular", "Medium", "Semibold", "Bold"];
  const sizes = ["xl", "lg", "md", "sm", "xs"];
  const pixels = ["24 | 32", "20 | 28", "16 | 24", "14 | 20", "12 | 16"];

  return (
    <Box mt={8}>
      <RenderTable
        variants={variants}
        sizes={sizes}
        pixels={pixels}
        type="Heading"
      />
    </Box>
  );
};

export const Texts: StoryFn = () => {
  const variants = ["Regular", "Medium", "Semibold", "Bold"];
  const sizes = ["lg", "md", "sm", "xs"];
  const pixels = ["20 | 28", "16 | 24", "14 | 20", "12 | 16"];

  return (
    <Box mt={8}>
      <RenderTable
        variants={variants}
        sizes={sizes}
        pixels={pixels}
        type="Body"
      />
    </Box>
  );
};

export const Elements: StoryFn = () => {
  const variants = ["Light", "Regular", "Medium", "Semibold", "Bold"];
  const sizes = ["2xl", "xl", "lg", "md", "sm", "xs"];
  const pixels = [
    "32 | 42",
    "24 | 32",
    "20 | 28",
    "16 | 24",
    "14 | 20",
    "12 | 16",
  ];

  return (
    <Box mt={8}>
      <RenderTable
        variants={variants}
        sizes={sizes}
        pixels={pixels}
        type="Elements"
      />
    </Box>
  );
};

const RenderTable = ({
  sizes,
  variants,
  pixels,
  type,
}: {
  sizes: string[];
  variants: string[];
  pixels: string[];
  type: string;
}) => {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th w={"200px"}>
            <Text textStyle={"ElementsRegularSM"} color={"neutral.700"}>
              Size | Line height
            </Text>
          </Th>
          {variants.map((variant) => {
            return (
              <Th>
                <Text textStyle={"ElementsRegularSM"} color={"neutral.700"}>
                  {variant}
                </Text>
              </Th>
            );
          })}
        </Tr>
      </Thead>
      <Tbody>
        {sizes.map((size, index) => {
          return (
            <Tr key={size} h={20}>
              <Td w={"200px"}>
                <Text
                  textStyle={"ElementsRegularSM"}
                  mb={1}
                  color={"neutral.700"}
                >
                  {pixels[index]}
                </Text>
              </Td>
              {variants.map((variant) => {
                return (
                  <Td>
                    {type === "Heading" ? (
                      <Heading
                        textStyle={`Heading${variant}${size.toUpperCase()}`}
                      >
                        Heading {size.toUpperCase()}
                      </Heading>
                    ) : (
                      <Text
                        textStyle={`${type}${variant}${size.toUpperCase()}`}
                      >
                        {type} {size.toUpperCase()}
                      </Text>
                    )}
                  </Td>
                );
              })}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
