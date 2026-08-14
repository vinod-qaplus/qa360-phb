export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return response.data.message;
  }
  if (error.response?.data?.title) {
    return error.response.data.title;
  }

  return error.message || "Unknown error";
}
