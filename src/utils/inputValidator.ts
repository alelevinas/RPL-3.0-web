export const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password: string): boolean =>
  password.length >= 6;

export const validateRequired = (value: string): boolean =>
  value.trim().length > 0;
