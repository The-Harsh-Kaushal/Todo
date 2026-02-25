export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data.msg === "string" && data.msg.trim()) {
    return data.msg;
  }

  if (data && typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
