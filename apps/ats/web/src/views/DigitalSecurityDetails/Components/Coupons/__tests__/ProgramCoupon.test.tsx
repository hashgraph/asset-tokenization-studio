// SPDX-License-Identifier: Apache-2.0

import { ProgramCoupon } from "../ProgramCoupon";
import { render } from "../../../../../test-utils";

jest.mock("../../../../../hooks/queries/useGetSecurityDetails", () => ({
  ...jest.requireActual("../../../../../hooks/queries/useGetSecurityDetails"),
  useGetBondDetails: () => ({
    data: {
      currency: "0x858368",
      nominalValue: "50",
      startingDate: "2023-11-29T23:00:00.000Z",
      maturityDate: "2028-01-30T23:00:00.000Z",
    },
  }),
}));

// TODO Improve tests when it is connected to SDK
describe(`${ProgramCoupon.name}`, () => {
  test("should render correctly", () => {
    const component = render(<ProgramCoupon />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
