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
  tokenBalance: "100",
  decimals: "2",
};

const mockDividendsData = {
  executionDate: new Date("2024-06-15T10:00:00Z"),
  amountPerUnitOfSecurity: "1.5",
};

const mockDividendsAmountForData = {
  numerator: "150",
  denominator: "1000",
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
      // Verify numerator from dividendsAmountFor
      expect(screen.getByText("150")).toBeInTheDocument();

      // Verify denominator from dividendsAmountFor
      expect(screen.getByText("1000")).toBeInTheDocument();

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
        numerator: "50",
        denominator: "500",
        recordDateReached: false,
      },
      refetch: mockRefetchDividendsAmountFor,
    });

    render(<SeeDividend />);

    await waitFor(() => {
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.getByText("No")).toBeInTheDocument();
    });
  });

  test("should not display details when data is not loaded", () => {
    render(<SeeDividend />);

    expect(screen.queryByText(/numerator/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/denominator/i)).not.toBeInTheDocument();
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
    expect(screen.queryByText("150")).not.toBeInTheDocument();
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
    expect(screen.queryByText("150")).not.toBeInTheDocument();
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
    expect(screen.queryByText("150")).not.toBeInTheDocument();
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

  test("should calculate and display correct dividend amount", async () => {
    mockUseGetDividendsFor.mockReturnValue({
      ...defaultHookResponse,
      data: {
        tokenBalance: "100",
        decimals: "2",
      },
      refetch: mockRefetchDividendsFor,
    });

    mockUseGetDividends.mockReturnValue({
      ...defaultHookResponse,
      data: {
        executionDate: new Date("2024-06-15T10:00:00Z"),
        amountPerUnitOfSecurity: "1.5",
      },
      refetch: mockRefetchDividends,
    });

    mockUseGetDividendsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockDividendsAmountForData,
      refetch: mockRefetchDividendsAmountFor,
    });

    render(<SeeDividend />);

    await waitFor(() => {
      // Amount = tokenBalance * amountPerUnitOfSecurity = 100 * 1.5 = 150
      expect(screen.getByText(/150/)).toBeInTheDocument();
    });
  });
});
