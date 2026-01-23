// SPDX-License-Identifier: Apache-2.0

import { CreateTokenButton } from "../CreateTokenButton";
import { render } from "../../../../test-utils";

describe(`${CreateTokenButton.name}`, () => {
  test("render correctly", () => {
    const component = render(<CreateTokenButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
