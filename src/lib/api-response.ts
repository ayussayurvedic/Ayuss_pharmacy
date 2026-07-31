import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Creates a standardized JSON success response.
 */
export function apiSuccess<T>(data: T, status: number = 200, headers: HeadersInit = {}): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
      headers,
    }
  );
}

/**
 * Creates a standardized JSON error response.
 */
export function apiError(
  message: string,
  status: number = 400,
  code?: string,
  headers: HeadersInit = {}
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code ? { code } : {}),
    },
    {
      status,
      headers,
    }
  );
}
