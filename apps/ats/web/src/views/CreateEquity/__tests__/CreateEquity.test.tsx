// SPDX-License-Identifier: Apache-2.0

import { CreateEquity } from "../CreateEquity";
import { render } from "../../../test-utils";

describe(`${CreateEquity.name}`, () => {
  test("render correctly", () => {
    const component = render(<CreateEquity />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
