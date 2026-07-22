export function captureException(error: any, context?: Record<string, any>) {
  const errorPayload = {
    message: error?.message || String(error),
    stack: error?.stack,
    context: context || {},
    timestamp: new Date().toISOString(),
  };

  console.error('[CRASH MONITORING CAPTURE]:', JSON.stringify(errorPayload));
  return errorPayload;
}
