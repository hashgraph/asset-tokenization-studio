// SPDX-License-Identifier: Apache-2.0

import { DetailsBalancePanel, DetailsBalancePanelProps } from "../DetailsBalancePanel";
import { render } from "../../test-utils";

const defaultProps: DetailsBalancePanelProps = {
  balance: "12",
  isLoading: false,
};

describe(`${DetailsBalancePanel.name}`, () => {
  const factoryComponent = (props = defaultProps) => render(<DetailsBalancePanel {...props} />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should show skeleton if is loading", () => {
    const component = factoryComponent({ balance: "", isLoading: true });

    expect(component.getByTestId("skeleton")).toBeInTheDocument();
  });

  test("should show a panel with the current available balance", () => {
    const component = factoryComponent();

    expect(component.getByTestId("current-available-balance-panel")).toBeInTheDocument();
  });

  test("should show a definition list with the security details", () => {
    const component = factoryComponent();

    expect(component.getByTestId("security-details")).toBeInTheDocument();
  });
});
