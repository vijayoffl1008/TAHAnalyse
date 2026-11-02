/**
 * Django backend response codes.
 * `response_code === 1000` indicates success.
 * All other values indicate specific errors from the Django service.
 *
 * Ported from AlgoHopperBot — error code definitions will be populated
 * as they are encountered during migration.
 */
export const ResponseCode = {
  SUCCESS: 1000,
} as const;

export type ResponseCode = (typeof ResponseCode)[keyof typeof ResponseCode];

/**
 * Check if a Django API response is successful.
 */
export const isSuccess = (responseCode: number): boolean =>
  responseCode === ResponseCode.SUCCESS;
