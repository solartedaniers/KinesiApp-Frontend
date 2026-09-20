import '../network/error_code.dart';

/// Mapea un [ErrorCode] del backend a una clave de i18n. Un code sin mapeo
/// explícito cae al mensaje genérico, nunca revienta ni muestra un `null`.
abstract final class ErrorMessageResolver {
  static const String genericKey = 'errorGeneric';

  static const Map<ErrorCode, String> _keyByCode = {
    ErrorCode.invalidCredentials: 'errorInvalidCredentials',
    ErrorCode.accountDisabled: 'errorAccountDisabled',
    ErrorCode.emailNotVerified: 'errorEmailNotVerified',
    ErrorCode.invalidOtp: 'errorInvalidOtp',
    ErrorCode.invalidRefreshToken: 'errorSessionExpired',
    ErrorCode.emailAlreadyRegistered: 'errorEmailAlreadyRegistered',
    ErrorCode.profileAlreadyExists: 'errorProfileAlreadyExists',
    ErrorCode.notFound: 'errorNotFound',
    ErrorCode.forbidden: 'errorForbidden',
    ErrorCode.invalidRoleAssignment: 'errorInvalidRoleAssignment',
  };

  static String keyFor(ErrorCode code) => _keyByCode[code] ?? genericKey;
}
