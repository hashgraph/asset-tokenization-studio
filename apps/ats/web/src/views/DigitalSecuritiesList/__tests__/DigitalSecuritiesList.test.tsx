// SPDX-License-Identifier: Apache-2.0

import { DigitalSecuritiesList } from "../DigitalSecuritiesList";
import { render } from "../../../test-utils";

describe(`${DigitalSecuritiesList.name}`, () => {
  test("render correctly", () => {
    const component = render(<DigitalSecuritiesList />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
