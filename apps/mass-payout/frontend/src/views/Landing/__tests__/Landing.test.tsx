// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { Landing } from "../Landing";

describe("<Landing />", () => {
  test("should render correctly", async () => {
    const component = render(<Landing />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
