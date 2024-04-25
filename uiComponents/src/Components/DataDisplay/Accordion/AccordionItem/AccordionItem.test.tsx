import { render } from "@/test-utils";
import { Text } from "@chakra-ui/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { AccordionItemProps } from "./AccordionItem";
import { AccordionItem } from "./AccordionItem";
import { Accordion } from "../Accordion";
import { CustomTitleComponent } from "./AccordionItem.stories";

const text = "Example children";
const title = "Accordion Item Title";

const defaultProps: AccordionItemProps = {
  title,
  children: <Text>{text}</Text>,
};

describe(`<AccordionItem />`, () => {
  const factoryComponent = (props: AccordionItemProps = defaultProps) =>
    render(
      <Accordion title="Accordion Test">
        <AccordionItem {...props} />
      </Accordion>
    );

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.getByText(title)).toBeVisible();
    expect(component).toMatchSnapshot();
  });

  test("onclick should expand and show children", async () => {
    const component = factoryComponent();

    expect(component.queryByText(text)).not.toBeVisible();

    userEvent.click(component.getByText(title));

    await waitFor(
      () => {
        expect(component.getByText(text)).toBeVisible();
      },
      { timeout: 50_000 }
    );
  });

  test("should render custom title", async () => {
    const customProps = {
      children: <Text>{text}</Text>,
      customTitle: <CustomTitleComponent />,
    };
    const component = factoryComponent(customProps);

    expect(component.getByTestId("custom-title")).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("customTitle");
  });
});
