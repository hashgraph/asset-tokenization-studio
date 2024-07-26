import { Balance } from "../Balance";
import { render } from "../../../../test-utils";
import { SecurityViewModel } from "@hashgraph/assettokenization-sdk";

// TODO Improve tests when it is connected to SDK
describe(`${Balance.name}`, () => {
  test("should render correctly", () => {
    const detailsResponse: SecurityViewModel = {
      name: "test",
    };

    const component = render(
      <Balance id="" detailsResponse={detailsResponse} />,
    );

    expect(component.asFragment()).toMatchSnapshot();
  });
});
