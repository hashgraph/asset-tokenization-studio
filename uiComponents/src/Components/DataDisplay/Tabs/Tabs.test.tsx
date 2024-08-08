import { render } from "@/test-utils";
import React from "react";
import type { TabsProps } from "./Tabs";
import { Tabs } from "./Tabs";

const tabs = [...Array(5)].map((_el, index) => ({
  header: `Tab ${index + 1}`,
  content: `Tab ${index + 1} Content `,
  "data-testid": `tab-header-${index + 1}`,
}));

describe(`<Tabs />`, () => {
  const factoryComponent = (props: TabsProps) => render(<Tabs {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent({ tabs });
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("Renders the number of tabs passed by arg", () => {
    const component = factoryComponent({ tabs });
    expect(component.getAllByTestId(/tab-header.*/).length).toBe(5);
    expect(component.asFragment()).toMatchSnapshot();
  });
});
