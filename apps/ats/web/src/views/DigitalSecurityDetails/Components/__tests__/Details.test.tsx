// SPDX-License-Identifier: Apache-2.0

import { Details } from "../Details";
import { render } from "../../../../test-utils";
import { BondDetailsViewModel, EquityDetailsViewModel, SecurityViewModel } from "@hashgraph/asset-tokenization-sdk";

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
        isLoadingSecurityDetails={false}
        isFetchingSecurityDetails={false}
      />,
    );

    expect(component.asFragment()).toMatchSnapshot();
  });
});
