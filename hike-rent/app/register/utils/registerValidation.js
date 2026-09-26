// Validasi formulir pendaftaran akun NEXORA
export function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errs = {};
  const cleanName = name.trim();
  const cleanEmail = email.trim();

  if (!cleanName) {
    errs.name = "Nama lengkap wajib diisi";
  } else if (cleanName.length < 3) {
    errs.name = "Nama minimal 3 karakter";
  }

  if (!cleanEmail) {
    errs.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errs.email = "Format email tidak valid (contoh: nama@email.com)";
  }

  if (!password) {
    errs.password = "Kata sandi wajib diisi";
  } else if (password.length < 6) {
    errs.password = "Kata sandi minimal 6 karakter";
  }

  if (!confirmPassword) {
    errs.confirmPassword = "Konfirmasi kata sandi wajib diisi";
  } else if (confirmPassword !== password) {
    errs.confirmPassword = "Konfirmasi kata sandi tidak cocok";
  }

  return errs;
}

export function EyeIcon({ open }) {
  return open ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-fog" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
