// SPDX-License-Identifier: Apache-2.0

import { SecurityDetails } from "../SecurityDetails";
import { render } from "../../../../test-utils";
import { useSecurityStore } from "../../../../store/securityStore";

const initialStoreState = useSecurityStore.getState();

const testSecurity = {
  decimals: 18,
  diamondAddress: "0.0.5863436",
  evmDiamondAddress: "0x83887e04c70e0b857738f89d12bf018bc0fe0310",
  isControllable: true,
  isWhiteList: false,
  isin: "123456789102",
  name: "Equity Total",
  paused: false,
  securityType: "EQUITY",
  symbol: "ET",
  totalSupply: "1150000000000000000000",
};

describe(`${SecurityDetails.name}`, () => {
  beforeEach(() => {
    useSecurityStore.setState(
      {
        ...initialStoreState,
        details: testSecurity,
      },
      true,
    );
  });

  const factoryComponent = () => render(<SecurityDetails />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should show loading state", () => {
    useSecurityStore.setState(
      {
        ...initialStoreState,
        details: null,
      },
      true,
    );

    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot("loading");
  });

  test("total supply should be formatted", () => {
    useSecurityStore.setState(
      {
        ...initialStoreState,
        details: testSecurity,
      },
      true,
    );

    const component = factoryComponent();
    const totalSupply = component.getByTestId("definition-list-item-Total Supply");
    expect(totalSupply).toHaveTextContent("Total Supply1150000000000000000000 ET");

    expect(component.asFragment()).toMatchSnapshot("loading");
  });
});
