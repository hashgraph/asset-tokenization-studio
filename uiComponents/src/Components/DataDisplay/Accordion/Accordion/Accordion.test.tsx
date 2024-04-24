import { render } from "@/test-utils";
import { Box, Text } from "@chakra-ui/react";
import type { RenderResult } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { AccordionProps } from "./Accordion";
import { Accordion } from "./Accordion";
import { AccordionItem } from "../AccordionItem";

const title = "Accordion Title";
const description = "Accordion Description";
const items = [
  {
    title: "First Element",
    content: "Content in First Element",
  },
  {
    title: "Second Element",
    content: "Content in Second Element",
  },
  {
    title: "Third Element",
    content: "Content in Third Element",
  },
];
const AccordionItems = () => {
  return (
    <Box>
      <AccordionItem title={items[0].title}>
        <Text>{items[0].content}</Text>
      </AccordionItem>
      <AccordionItem title={items[1].title}>
        <Text>{items[1].content}</Text>
      </AccordionItem>
      <AccordionItem title={items[2].title}>
        <Text>{items[2].content}</Text>
      </AccordionItem>
    </Box>
  );
};

const defaultProps: AccordionProps = {
  title,
  children: <AccordionItems />,
};

describe(`<Accordion />`, () => {
  const factoryComponent = (props: AccordionProps = defaultProps) =>
    render(<Accordion {...props} />);

  const checkAllIsCollapsed = (component: RenderResult) => {
    items.forEach((item) => {
      expect(component.getByText(item.title)).toBeVisible();
      expect(component.queryByText(item.content)).not.toBeVisible();
    });
  };

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component).toMatchSnapshot();
  });

  test("should render with description", () => {
    const component = factoryComponent({ ...defaultProps, description });

    expect(component.getByText(description)).toBeVisible();
  });

  test("should render collapsed items", () => {
    const component = factoryComponent();

    checkAllIsCollapsed(component);
  });

  // TODO: improve this test, works in local but fails in pipeline
  test.skip("by default when open an item all other items are collapsed", async () => {
    const component = factoryComponent({
      ...defaultProps,
    });

    checkAllIsCollapsed(component);

    userEvent.click(component.getByText(items[0].title));

    await waitFor(() => {
      expect(component.getByText(items[0].content)).toBeVisible();
      expect(component.queryByText(items[1].content)).not.toBeVisible();
      expect(component.queryByText(items[2].content)).not.toBeVisible();
    });

    userEvent.click(component.getByText(items[1].title));

    await waitFor(() => {
      expect(component.queryByText(items[0].content)).not.toBeVisible();
      expect(component.getByText(items[1].content)).toBeVisible();
      expect(component.queryByText(items[2].content)).not.toBeVisible();
    });

    userEvent.click(component.getByText(items[2].title));

    await waitFor(() => {
      expect(component.queryByText(items[0].content)).not.toBeVisible();
      expect(component.queryByText(items[1].content)).not.toBeVisible();
      expect(component.getByText(items[2].content)).toBeVisible();
    });
  });

  test.skip("with AllowMultiple all items could be expanded", async () => {
    const component = factoryComponent({
      ...defaultProps,
      allowMultiple: true,
    });

    checkAllIsCollapsed(component);

    userEvent.click(component.getByText(items[0].title));

    await waitFor(() => {
      expect(component.getByText(items[0].content)).toBeVisible();
      expect(component.queryByText(items[1].content)).not.toBeVisible();
      expect(component.queryByText(items[2].content)).not.toBeVisible();
    });

    userEvent.click(component.getByText(items[1].title));

    await waitFor(() => {
      expect(component.getByText(items[0].content)).toBeVisible();
      expect(component.getByText(items[1].content)).toBeVisible();
      expect(component.queryByText(items[2].content)).not.toBeVisible();
    });

    userEvent.click(component.getByText(items[2].title));

    await waitFor(() => {
      expect(component.getByText(items[0].content)).toBeVisible();
      expect(component.getByText(items[1].content)).toBeVisible();
      expect(component.getByText(items[2].content)).toBeVisible();
    });
  });
});
