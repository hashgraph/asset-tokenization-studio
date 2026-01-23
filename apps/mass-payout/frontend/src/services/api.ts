// SPDX-License-Identifier: Apache-2.0

const getApiBaseUrl = () => {
  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test") {
    return process.env.VITE_API_URL || "http://localhost:3000";
  }

  try {
    // @ts-ignore
    if (typeof window !== "undefined" && (window as any).import?.meta?.env?.VITE_API_URL) {
      // @ts-ignore
      return (window as any).import.meta.env.VITE_API_URL;
    }
  } catch (error) {
    // Fallback si import.meta no está disponible
  }
  return "http://localhost:3000";
};

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
  }
  return response;
};

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: Record<string, unknown> | unknown[] | string | number | boolean | null;
}

export const apiRequest = async <T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { method = "GET", headers = {}, body } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  await handleResponse(response);

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return {} as T;
};

export const buildUrl = (template: string, params: Record<string, string>): string => {
  return Object.entries(params).reduce((url, [key, value]) => url.replace(`:${key}`, value), template);
};
