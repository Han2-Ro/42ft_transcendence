export const USERNAME_REQUIREMENTS_MESSAGE =
  "Username must be 3–20 characters and only contain letters, numbers, '.', '_', or '-'.";

export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number.";

export function checkPasswordStrength(password: string) {
  if (password.length < 8) return false;
  else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return false;
  else if (!/[0-9]/.test(password)) return false;
  return true;
}

export function checkUsername(username: string) {
  if (username.length < 3 || username.length > 20) return false;
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(username)) return false;
  return true;
}
