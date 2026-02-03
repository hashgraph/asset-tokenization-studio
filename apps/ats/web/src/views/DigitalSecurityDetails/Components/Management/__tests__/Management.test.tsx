// SPDX-License-Identifier: Apache-2.0

import { render } from "../../../../../test-utils";
import { Management } from "../Management";

describe(`${Management.name}`, () => {
  test("should render correctly", () => {
    const component = render(<Management id={"0.0.12345"} />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
