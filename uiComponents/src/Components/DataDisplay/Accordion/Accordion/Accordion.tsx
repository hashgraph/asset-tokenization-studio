import type { AccordionProps as ChakraAccordionProps } from "@chakra-ui/react";
import { Accordion as ChakraAccordion } from "@chakra-ui/accordion";
import { Box as ChakraBox, Divider as ChakraDivider } from "@chakra-ui/layout";
import type {
  SystemStyleObject as ChakraSystemStyleObject,
  ComponentWithAs,
} from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import React from "react";
import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@/Theme/Components/BaseMultiStyleConfiguration";
import { Text } from "@/Components/Foundations/Text";

export interface AccordionProps
  extends Omit<ChakraAccordionProps, "children" | "title" | "description"> {
  children: React.ReactNode;
  description?: string;
  title: string;
}

const accordionPartsList: Array<string> = ["container", "title", "item"];

type Parts = typeof accordionPartsList;

export interface AccordionThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (() => Partial<AccordionThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

export type AccordionThemeStyle = Record<
  Parts[number],
  ChakraSystemStyleObject
>;

export const Accordion: ComponentWithAs<"div", AccordionProps> = forwardRef<
  AccordionProps,
  "div"
>(({ children, description, title, ...props }: AccordionProps, ref) => {
  const styles = useChakraMultiStyleConfig("Accordion");

  return (
    <ChakraAccordion ref={ref} {...props} sx={styles.container}>
      <ChakraBox sx={styles.titleContainer}>
        <Text sx={styles.title}>{title}</Text>
      </ChakraBox>
      <ChakraDivider sx={styles.divider} />
      {description && (
        <ChakraBox sx={styles.descriptionContainer}>
          <Text sx={styles.description}>{description}</Text>
        </ChakraBox>
      )}
      <ChakraBox sx={styles.itemsContainer}>{children}</ChakraBox>
    </ChakraAccordion>
  );
});
