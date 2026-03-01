export function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function isStrongPassword(pw) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw || "");
}

export function safeText(s, max = 255) {
  const val = String(s || "").trim();
  if (!val || val.length > max) return null;
  return val;
}

export function isPhone(s) {
  return /^[0-9+\-\s]{7,20}$/.test(String(s || "").trim());
}

export function daysBetween(checkIn, checkOut) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = (b - a) / (1000 * 60 * 60 * 24);
  return Number.isFinite(diff) ? Math.floor(diff) : NaN;
}