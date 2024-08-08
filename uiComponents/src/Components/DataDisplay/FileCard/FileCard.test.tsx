import { render } from "@/test-utils";
import React from "react";
import type { FileCardProps } from "./FileCard";
import { FileCard } from "./FileCard";

const errorMsg = "Error uploading the file, please try again.";

describe(`<FileCard />`, () => {
  const file = new File(["99999"], "filename.pdf", { type: "text/html" });
  const defaultProps = {
    file,
  };
  const isInvalid = { isInvalid: true };

  const factoryComponent = (props: FileCardProps = defaultProps) =>
    render(<FileCard {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly file name", () => {
    const component = factoryComponent({ ...defaultProps });
    const textName = component.getByTestId("text-filename");

    expect(textName.textContent).toBe(file.name);
  });

  test("shows error message when is invalid ", () => {
    const component = factoryComponent({ ...defaultProps, ...isInvalid });
    const textSize = component.getByTestId("text-size");

    expect(textSize.textContent).toContain(errorMsg);
  });

  test("should show skeleton when isLoading is true", () => {
    const component = factoryComponent({ isLoading: true, ...defaultProps });
    expect(component.container).toMatchSnapshot("WithLoading");
  });
});
