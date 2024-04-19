import { Details } from "../Details";
import { render } from "../../../../test-utils";
import {
  BondDetailsViewModel,
  EquityDetailsViewModel,
  SecurityViewModel,
} from "@iob/securitytoken-sdk";

// TODO Improve tests when it is connected to SDK
describe(`${Details.name}`, () => {
  test("should render correctly", () => {
    const detailsResponse: SecurityViewModel = {
      name: "test",
    };

    const component = render(
      <Details
        id=""
        detailsResponse={detailsResponse}
        equityDetailsResponse={{} as EquityDetailsViewModel}
        bondDetailsResponse={{} as BondDetailsViewModel}
      />,
    );

    expect(component.asFragment()).toMatchSnapshot();
  });
});
