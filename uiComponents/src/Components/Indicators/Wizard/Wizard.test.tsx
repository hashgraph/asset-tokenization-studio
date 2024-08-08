import React from "react";
import { Wizard } from "./Wizard";
import { render } from "@/test-utils";

describe(`< ${Wizard.name} />`, () => {
  const factoryComponent = (props: any = {}) => render(<Wizard {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent({
      steps: [
        {
          title: "First",
          description:
            "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          content: <div>First</div>,
        },
        {
          title: "Second",
          description: "Contact Info ",
          content: <div>Second</div>,
        },
        {
          title: "Third",
          description:
            "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          content: <div>Third</div>,
        },
        {
          title: "Four",
          description:
            "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          content: <div>Four</div>,
        },
        {
          title: "Five",
          description:
            "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          content: <div>Five</div>,
        },
        {
          title: "Six",
          description:
            "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          content: <div>Six</div>,
        },
      ],
    });

    expect(component.asFragment()).toMatchSnapshot("Default Wizard");
  });
});
