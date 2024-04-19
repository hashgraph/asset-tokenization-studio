import { Coupons } from "../Coupons";
import { render } from "../../../../../test-utils";

jest.mock("../../../../../hooks/queries/useGetSecurityDetails", () => ({
  ...jest.requireActual("../../../../../hooks/queries/useGetSecurityDetails"),
  useGetBondDetails: () => ({
    data: {
      currency: "0x858368",
      nominalValue: "50",
      startingDate: "2023-11-29T23:00:00.000Z",
      maturityDate: "2027-01-30T23:00:00.000Z",
    },
  }),
}));

describe(`${Coupons.name}`, () => {
  test("should render correctly", () => {
    const component = render(<Coupons />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
