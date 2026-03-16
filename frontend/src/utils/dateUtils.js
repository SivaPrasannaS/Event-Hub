export const formatDateTime = (value) => {
  if (!value) {
    return 'TBD';
  }
  return new Date(value).toLocaleString();
};

export const toInputDateTime = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 16);
};
