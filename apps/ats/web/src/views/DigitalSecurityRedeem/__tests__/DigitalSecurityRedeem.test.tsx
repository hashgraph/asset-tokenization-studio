// SPDX-License-Identifier: Apache-2.0

import { DigitalSecurityRedeem } from "../DigitalSecurityRedeem";
import { render } from "../../../test-utils";

describe(`${DigitalSecurityRedeem.name}`, () => {
  const factoryComponent = () => {
    return render(<DigitalSecurityRedeem />);
  };

  test("render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should show Goback button", () => {
    const component = factoryComponent();

    const breadcrumbs = component.getByTestId("go-back-button");
    expect(breadcrumbs).toBeInTheDocument();
  });

  test("should show breadcrumbs", () => {
    const component = factoryComponent();

    const breadcrumbs = component.getByTestId("breadcrumb-desktop");
    expect(breadcrumbs).toBeInTheDocument();
  });

  test("should form be rendered properly", () => {
    const component = factoryComponent();

    const form = component.getByTestId("redeem-form");
    expect(form).toBeInTheDocument();
  });
});
