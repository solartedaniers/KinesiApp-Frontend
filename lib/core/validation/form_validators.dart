/// Validadores reutilizables para `Form`/`TextFormField`. Devuelven la clave de i18n
/// del mensaje de error (o null si el valor es válido), nunca el texto ya traducido:
/// la vista es quien tiene el `BuildContext` para traducir con `context.tr(key)`.
abstract final class FormValidators {
  /// Espejo de `UserCreate.password` en el backend (`Field(min_length=8)`).
  static const int minPasswordLength = 8;

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
    return value!.length >= minPasswordLength
        ? null
        : 'validatorPasswordTooShort';
  }
}
