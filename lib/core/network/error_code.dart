/// Espejo del `ErrorCode` del backend (`app/core/exceptions.py`). El cliente
/// traduce por code, nunca parseando el `detail` en inglés que manda la API.
enum ErrorCode {
  badRequest('bad_request'),
  notFound('not_found'),
  conflict('conflict'),
  unauthorized('unauthorized'),
  forbidden('forbidden'),
  emailAlreadyRegistered('email_already_registered'),
  profileAlreadyExists('profile_already_exists'),
  invalidCredentials('invalid_credentials'),
  accountDisabled('account_disabled'),
  emailNotVerified('email_not_verified'),
  invalidOtp('invalid_otp'),
  invalidRefreshToken('invalid_refresh_token'),
  invalidRoleAssignment('invalid_role_assignment'),
  unknown('unknown');

  const ErrorCode(this.wireValue);

  final String wireValue;

  static ErrorCode fromWire(String? value) => ErrorCode.values.firstWhere(
    (code) => code.wireValue == value,
    orElse: () => ErrorCode.unknown,
  );
}
