// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { MainLayout } from "../MainLayout";

describe("<MainLayout />", () => {
  test("should render correctly", async () => {
    const component = render(<MainLayout />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
