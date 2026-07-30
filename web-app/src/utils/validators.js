export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isNonEmptyString = (val) => {
  return typeof val === 'string' && val.trim().length > 0;
};
