// SPDX-License-Identifier: Apache-2.0

import { EditRole } from "../EditRole";
import { render } from "../../../../../test-utils";

// TODO Improve tests when it is connected to SDK
describe(`${EditRole.name}`, () => {
  test("should render correctly", () => {
    const component = render(<EditRole />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
