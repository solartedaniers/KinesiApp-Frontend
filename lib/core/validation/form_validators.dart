/// Validadores reutilizables para `Form`/`TextFormField`. Devuelven la clave de i18n
/// del mensaje de error (o null si el valor es válido), nunca el texto ya traducido:
/// la vista es quien tiene el `BuildContext` para traducir con `context.tr(key)`.
abstract final class FormValidators {
  /// Espejo de `StrongPassword` en el backend (`app/schemas/password_policy.py`):
  /// 8 a 128 caracteres, con al menos una letra y un dígito.
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;

  static final RegExp _letterPattern = RegExp(r'\p{L}', unicode: true);
  static final RegExp _digitPattern = RegExp(r'\d');

  static final RegExp _emailPattern = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

  static String? required(String? value) =>
      (value == null || value.trim().isEmpty) ? 'validatorRequired' : null;

  static String? email(String? value) {
    final requiredError = required(value);
    if (requiredError != null) return requiredError;
    return _emailPattern.hasMatch(value!.trim())
        ? null
        : 'validatorInvalidEmail';
  }

  static String? password(String? value) {
    final requiredError = required(value);
    if (requiredError != null) return requiredError;
    if (value!.length < minPasswordLength) return 'validatorPasswordTooShort';
    if (value.length > maxPasswordLength) return 'validatorPasswordTooLong';
    return _letterPattern.hasMatch(value) && _digitPattern.hasMatch(value)
        ? null
        : 'validatorPasswordWeak';
  }

  static String? otp(String? value) {
    final requiredError = required(value);
    if (requiredError != null) return requiredError;
    return RegExp(r'^\d{6}$').hasMatch(value!.trim())
        ? null
        : 'validatorInvalidOtpFormat';
  }
}
