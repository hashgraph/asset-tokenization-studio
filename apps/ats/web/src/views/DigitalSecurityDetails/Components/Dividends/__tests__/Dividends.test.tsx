// SPDX-License-Identifier: Apache-2.0

import { Dividends } from "../Dividends";
import { render } from "../../../../../test-utils";

describe(`${Dividends.name}`, () => {
  test("should render correctly", () => {
    const component = render(<Dividends />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
