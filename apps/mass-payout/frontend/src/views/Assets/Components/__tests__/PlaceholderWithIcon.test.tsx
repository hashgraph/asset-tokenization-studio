// SPDX-License-Identifier: Apache-2.0

import { render } from "../../../../test-utils";
import { PlaceholderWithIcon } from "../PlaceholderWithIcon";

describe("PlaceholderWithIcon", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render correctly", () => {
      const component = render(<PlaceholderWithIcon />);
      expect(component.asFragment()).toMatchSnapshot();
    });
  });
});
