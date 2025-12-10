// SPDX-License-Identifier: Apache-2.0

import { SeeDividend } from "../SeeDividend";
import { render } from "../../../../../test-utils";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import {
  useGetDividends,
  useGetDividendsFor,
  useGetDividendsAmountFor,
} from "../../../../../hooks/queries/useDividends";

jest.mock("../../../../../hooks/queries/useDividends");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "0.0.12345" }),
}));

const mockUseGetDividendsFor = useGetDividendsFor as jest.Mock;
const mockUseGetDividends = useGetDividends as jest.Mock;
const mockUseGetDividendsAmountFor = useGetDividendsAmountFor as jest.Mock;

const mockRefetchDividendsFor = jest.fn();
const mockRefetchDividends = jest.fn();
const mockRefetchDividendsAmountFor = jest.fn();

const defaultHookResponse = {
  data: undefined,
  refetch: jest.fn(),
  isLoading: false,
  isError: false,
};

const mockDividendsForData = {
  tokenBalance: "10000",
  decimals: "2",
};

const mockDividendsData = {
  executionDate: new Date("2024-06-15T10:00:00Z"),
  amountPerUnitOfSecurity: "1.5",
};

const mockDividendsAmountForData = {
  numerator: "150",
  denominator: "100",
  recordDateReached: true,
};

const getFormInputsByName = () => {
  const dividendInput = document.querySelector('input[name="dividendId"]') as HTMLInputElement;
  const accountInput = document.querySelector('input[name="targetId"]') as HTMLInputElement;
  return { dividendInput, accountInput };
};

describe(`${SeeDividend.name}`, () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGetDividendsFor.mockReturnValue({
      ...defaultHookResponse,
      refetch: mockRefetchDividendsFor,
    });

    mockUseGetDividends.mockReturnValue({
      ...defaultHookResponse,
      refetch: mockRefetchDividends,
    });

    mockUseGetDividendsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      refetch: mockRefetchDividendsAmountFor,
    });
  });

  test("should render correctly", () => {
    const component = render(<SeeDividend />);
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should render form inputs", () => {
    render(<SeeDividend />);

    const { dividendInput, accountInput } = getFormInputsByName();
    expect(dividendInput).toBeInTheDocument();
    expect(accountInput).toBeInTheDocument();
  });

  test("should disable submit button when form is invalid", () => {
    render(<SeeDividend />);

    const submitButton = screen.getByRole("button");
    expect(submitButton).toBeDisabled();
  });

  test("should enable submit button when form is valid", async () => {
    render(<SeeDividend />);

    const { dividendInput, accountInput } = getFormInputsByName();

    fireEvent.change(dividendInput, { target: { value: "1" } });
    fireEvent.change(accountInput, { target: { value: "0.0.12345" } });

    await waitFor(() => {
      const submitButton = screen.getByRole("button");
      expect(submitButton).not.toBeDisabled();
    });
  });

  test("should call refetch functions on form submit", async () => {
    render(<SeeDividend />);

    const { dividendInput, accountInput } = getFormInputsByName();

    fireEvent.change(dividendInput, { target: { value: "1" } });
    fireEvent.change(accountInput, { target: { value: "0.0.12345" } });

    await waitFor(() => {
      const submitButton = screen.getByRole("button");
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole("button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRefetchDividendsFor).toHaveBeenCalled();
      expect(mockRefetchDividends).toHaveBeenCalled();
      expect(mockRefetchDividendsAmountFor).toHaveBeenCalled();
    });
  });

  test("should display dividend details when all data is loaded", async () => {
    mockUseGetDividendsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsForData,
      refetch: mockRefetchDividendsFor,
    });

    mockUseGetDividends.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsData,
      refetch: mockRefetchDividends,
    });

    mockUseGetDividendsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsAmountForData,
      refetch: mockRefetchDividendsAmountFor,
    });

    render(<SeeDividend />);

    await waitFor(() => {
      // Verify balance from dividendsFor (tokenBalance: "10000", decimals: "2" -> 100.00)
      expect(screen.getByText("100.00")).toBeInTheDocument();

      // Verify amount calculated as numerator/denominator (150/100 = 1.500 $)
      expect(screen.getByText("1.500 $")).toBeInTheDocument();

      // Verify recordDateReached from dividendsAmountFor (displays "Yes")
      expect(screen.getByText("Yes")).toBeInTheDocument();
    });
  });

  test("should display recordDateReached as No when it is false", async () => {
    mockUseGetDividendsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsForData,
      refetch: mockRefetchDividendsFor,
    });

    mockUseGetDividends.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsData,
      refetch: mockRefetchDividends,
    });

    mockUseGetDividendsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: {
        numerator: "500",
        denominator: "100",
        recordDateReached: false,
      },
      refetch: mockRefetchDividendsAmountFor,
    });

    render(<SeeDividend />);

    await waitFor(() => {
      // Verify amount calculated as 500/100 = 5.000 $
      expect(screen.getByText("5.000 $")).toBeInTheDocument();
      expect(screen.getByText("No")).toBeInTheDocument();
    });
  });

  test("should display 0 for amount when numerator is 0", async () => {
    mockUseGetDividendsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsForData,
      refetch: mockRefetchDividendsFor,
    });

    mockUseGetDividends.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsData,
      refetch: mockRefetchDividends,
    });

    mockUseGetDividendsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: {
        numerator: "0",
        denominator: "100",
        recordDateReached: true,
      },
      refetch: mockRefetchDividendsAmountFor,
    });

    render(<SeeDividend />);

    await waitFor(() => {
      // Amount should be "0" when numerator is 0
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  test("should display 0 for amount when denominator is 0", async () => {
    mockUseGetDividendsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsForData,
      refetch: mockRefetchDividendsFor,
    });

    mockUseGetDividends.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsData,
      refetch: mockRefetchDividends,
    });

    mockUseGetDividendsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: {
        numerator: "100",
        denominator: "0",
        recordDateReached: false,
      },
      refetch: mockRefetchDividendsAmountFor,
    });

    render(<SeeDividend />);

    await waitFor(() => {
      // Amount should be "0" when denominator is 0
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("No")).toBeInTheDocument();
    });
  });

  test("should not display details when data is not loaded", () => {
    render(<SeeDividend />);

    expect(screen.queryByText(/balance/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/amount/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recordDateReached/i)).not.toBeInTheDocument();
  });

  test("should not display details when dividendsFor is missing", () => {
    mockUseGetDividends.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsData,
      refetch: mockRefetchDividends,
    });

    mockUseGetDividendsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsAmountForData,
      refetch: mockRefetchDividendsAmountFor,
    });

    render(<SeeDividend />);

    // Details should not be visible without dividendsFor
    expect(screen.queryByText("1.500 $")).not.toBeInTheDocument();
  });

  test("should not display details when dividends is missing", () => {
    mockUseGetDividendsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsForData,
      refetch: mockRefetchDividendsFor,
    });

    mockUseGetDividendsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsAmountForData,
      refetch: mockRefetchDividendsAmountFor,
    });

    render(<SeeDividend />);

    // Details should not be visible without dividends
    expect(screen.queryByText("1.500 $")).not.toBeInTheDocument();
  });

  test("should not display details when dividendsAmountFor is missing", () => {
    mockUseGetDividendsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsForData,
      refetch: mockRefetchDividendsFor,
    });

    mockUseGetDividends.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsData,
      refetch: mockRefetchDividends,
    });

    render(<SeeDividend />);

    // Details should not be visible without dividendsAmountFor
    expect(screen.queryByText("1.500 $")).not.toBeInTheDocument();
  });

  test("should validate dividendId with min value of 0", async () => {
    render(<SeeDividend />);

    const { dividendInput, accountInput } = getFormInputsByName();

    fireEvent.change(dividendInput, { target: { value: "-1" } });
    fireEvent.change(accountInput, { target: { value: "0.0.12345" } });

    await waitFor(() => {
      const submitButton = screen.getByRole("button");
      expect(submitButton).toBeDisabled();
    });
  });

  test("should validate targetId as valid Hedera ID", async () => {
    render(<SeeDividend />);

    const { dividendInput, accountInput } = getFormInputsByName();

    fireEvent.change(dividendInput, { target: { value: "1" } });
    fireEvent.change(accountInput, { target: { value: "invalid-id" } });

    await waitFor(() => {
      const submitButton = screen.getByRole("button");
      expect(submitButton).toBeDisabled();
    });
  });

  test("should show loading state when fetching data", async () => {
    render(<SeeDividend />);

    const { dividendInput, accountInput } = getFormInputsByName();

    fireEvent.change(dividendInput, { target: { value: "1" } });
    fireEvent.change(accountInput, { target: { value: "0.0.12345" } });

    await waitFor(() => {
      const submitButton = screen.getByRole("button");
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole("button");
    fireEvent.click(submitButton);

    // Button should show loading state after click
    await waitFor(() => {
      expect(submitButton).toHaveAttribute("data-loading");
    });
  });

  test("should calculate amount with 3 decimal places", async () => {
    mockUseGetDividendsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsForData,
      refetch: mockRefetchDividendsFor,
    });

    mockUseGetDividends.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsData,
      refetch: mockRefetchDividends,
    });

    mockUseGetDividendsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: {
        numerator: "1",
        denominator: "3",
        recordDateReached: true,
      },
      refetch: mockRefetchDividendsAmountFor,
    });

    render(<SeeDividend />);

    await waitFor(() => {
      // 1/3 = 0.333... should be formatted to 0.333 $
      expect(screen.getByText("0.333 $")).toBeInTheDocument();
    });
  });
});
