export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  const apiError = error?.response?.data?.error;
  const apiMessage = error?.response?.data?.message;
  const validationError = error?.response?.data?.errors?.[0]?.msg;

  const candidate = apiError ?? apiMessage ?? validationError ?? error?.message ?? error;

  if (typeof candidate === 'string') {
    return candidate;
  }

  if (candidate && typeof candidate === 'object') {
    if (typeof candidate.message === 'string') {
      return candidate.message;
    }

    try {
      return JSON.stringify(candidate);
    } catch (_) {
      return fallback;
    }
  }

  return fallback;
};
