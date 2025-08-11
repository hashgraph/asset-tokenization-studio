import { fireEvent } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { render } from '../../../../../test-utils';
import { CapSetMaxSupplyForm } from '../CapSetMaxSupplyForm';

describe(`${CapSetMaxSupplyForm.name}`, () => {
  test('should render correctly', () => {
    const component = render(<CapSetMaxSupplyForm />);

    expect(component.asFragment()).toMatchSnapshot();
  });

  test('should disable the submit button if the form is invalid', () => {
    const component = render(<CapSetMaxSupplyForm />);

    const submitButton = component.getByTestId('set-max-supply-button');

    expect(submitButton).toBeDisabled();
  });

  test('should validate maxSupply field', async () => {
    const component = render(<CapSetMaxSupplyForm />);

    fireEvent.change(component.getByTestId('maxSupply'), {
      target: { value: '-1' },
    });

    expect(
      await component.findByText(/Value should be greater or equal than 0/i),
    ).toBeInTheDocument();
  });

  test('should enable the submit button if the form is valid', async () => {
    const component = render(<CapSetMaxSupplyForm />);

    const submitButton = component.getByTestId('set-max-supply-button');

    expect(submitButton).toBeDisabled();

    fireEvent.change(component.getByTestId('securityId'), {
      target: { value: '0.0.123456' },
    });
    fireEvent.change(component.getByTestId('maxSupply'), {
      target: { value: '1000' },
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });
});
