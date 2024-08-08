import React from "react";
import { render } from "@/test-utils";
import { Stepper, Step } from "./index";
const steps = [
  {
    title: "First",
    description:
      "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  { title: "Second", description: "Date & Time" },
  { title: "Third", description: "Select Rooms" },
];

describe(`< ${Stepper.name} />`, () => {
  const factoryComponent = (props: any = {}) => render(<Stepper {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent({
      index: 1,
      children: steps.map((step, index) => <Step key={index} {...step} />),
    });

    expect(component.asFragment()).toMatchSnapshot("Default Stepper");
  });

  test("renders correctly with index", () => {
    const component = factoryComponent({
      index: 2,
      children: steps.map((step, index) => <Step key={index} {...step} />),
    });

    expect(component.asFragment()).toMatchSnapshot("Stepper with index");
  });
});
