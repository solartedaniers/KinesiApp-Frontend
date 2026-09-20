import '../user_role.dart';

/// DTO de la respuesta de /auth/register y /auth/me (esquema UserRead del backend).
class CurrentUser {
  const CurrentUser({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.isActive,
    required this.isVerified,
  });

  final int id;
  final String email;
  final String fullName;
  final UserRole role;
  final bool isActive;
  final bool isVerified;

  factory CurrentUser.fromJson(Map<String, dynamic> json) => CurrentUser(
    id: json['id'] as int,
    email: json['email'] as String,
    fullName: json['full_name'] as String,
    role: UserRole.fromApiValue(json['role'] as String),
    isActive: json['is_active'] as bool,
    isVerified: json['is_verified'] as bool,
  );
}
