// SPDX-License-Identifier: Apache-2.0

import { SecurityCard } from "../SecurityCard";
import { render } from "../../../../test-utils";

const defaultProps = {
  digitalSecurity: {
    name: "testing",
    symbol: "TEST",
    isin: "123456789101",
    address: "0.0.123456",
    evmAddress: "0x38949962d54e5a2c6081d7e87203e3565e90cc80",
  },
  isAdmin: true,
};

describe(`${SecurityCard.name}`, () => {
  test("render correctly as admin", () => {
    const component = render(<SecurityCard {...defaultProps} />);

    expect(component.asFragment()).toMatchSnapshot("admin");
  });

  test("render correctly as holder", () => {
    const component = render(<SecurityCard {...defaultProps} isAdmin={false} />);

    expect(component.asFragment()).toMatchSnapshot("holder");
  });
});
