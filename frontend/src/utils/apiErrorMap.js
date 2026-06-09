const backendErrorMap = {
  "Email đã tồn tại": "apiErrors.emailAlreadyExists",
  "Email không tồn tại": "apiErrors.emailNotFound",
  "Mật khẩu không chính xác": "apiErrors.wrongPassword",
  "Vui lòng xác minh email trước khi đăng nhập": "apiErrors.notVerified",
  "Email đã được xác minh trước đó": "apiErrors.alreadyVerified",
  "Mã xác minh không chính xác hoặc email không khớp":
    "apiErrors.invalidVerificationCode",
  "Mã OTP không chính xác hoặc email không khớp": "apiErrors.invalidOtp",
  "Người dùng không tồn tại": "apiErrors.userNotFound",
  "Vui lòng sử dụng email thật, không dùng email tạm thời/email ảo":
    "apiErrors.disposableEmail",
};

export function resolveApiError(backendMessage, t, fallbackKey) {
  if (!backendMessage) return t(fallbackKey);
  const key = backendErrorMap[backendMessage];
  return key ? t(key) : backendMessage || t(fallbackKey);
}
