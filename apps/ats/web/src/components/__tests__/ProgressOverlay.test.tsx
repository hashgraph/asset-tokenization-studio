// SPDX-License-Identifier: Apache-2.0

import { render } from "../../test-utils";
import { ProgressOverlay, ProgressOverlayProps } from "../ProgressOverlay";

const defaultProps: ProgressOverlayProps = {
  isOpen: true,
  title: "Loading Security Details",
  description: "Please wait while we fetch all the information...",
  progress: 42,
  steps: [
    { id: "details", label: "Loading Details", status: "completed" },
    { id: "balance", label: "Loading Balance", status: "in-progress" },
    { id: "operations", label: "Loading Operations", status: "pending" },
    { id: "management", label: "Loading Management", status: "pending" },
    { id: "control", label: "Loading Control", status: "pending" },
  ],
};

describe(`${ProgressOverlay.name}`, () => {
  const factoryComponent = () => render(<ProgressOverlay {...defaultProps} />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });
  test("should render title, description, progress and steps", () => {
    const component = factoryComponent();
    expect(component.getByText(defaultProps.title)).toBeInTheDocument();
    expect(component.getByText(defaultProps.description!)).toBeInTheDocument();
    expect(component.getByText("42%")).toBeInTheDocument();
    expect(component.getByText("Loading Details")).toBeInTheDocument();
    expect(component.getByText("Loading Balance")).toBeInTheDocument();
    expect(component.getByText("Loading Operations")).toBeInTheDocument();
    expect(component.getByText("Loading Management")).toBeInTheDocument();
    expect(component.getByText("Loading Control")).toBeInTheDocument();
  });
});
