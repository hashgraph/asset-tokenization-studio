// SPDX-License-Identifier: Apache-2.0

import { CreateBond } from "../CreateBond";
import { render } from "../../../test-utils";

describe(`${CreateBond.name}`, () => {
  test("render correctly", () => {
    const component = render(<CreateBond />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
