export const createApiResponse = (data, message = null, requestId = null) => ({
  success: true,
  message,
  data,
  request_id: requestId,
});

export const createErrorResponse = (code, message, details = null, requestId = null) => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
  request_id: requestId,
});
