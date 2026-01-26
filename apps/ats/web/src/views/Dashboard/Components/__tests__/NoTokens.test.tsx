// SPDX-License-Identifier: Apache-2.0

import { NoTokens } from "../NoTokens";
import { render } from "../../../../test-utils";

describe(`${NoTokens.name}`, () => {
  test("render correctly", () => {
    const component = render(<NoTokens />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
