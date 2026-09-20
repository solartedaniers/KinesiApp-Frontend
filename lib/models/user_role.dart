enum UserRole {
  athlete,
  coach,
  admin;

  /// Mapea el string de rol del backend (p. ej. "athlete") al enum local.
  static UserRole fromApiValue(String value) => UserRole.values.firstWhere(
    (role) => role.name == value,
    orElse: () => UserRole.athlete,
  );
}
