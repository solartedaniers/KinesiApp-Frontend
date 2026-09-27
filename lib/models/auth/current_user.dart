import 'dart:typed_data';

import '../avatar/avatar_data.dart';
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
    this.avatarBytes,
    this.videoConsentVersion,
  });

  final int id;
  final String email;
  final String fullName;
  final UserRole role;
  final bool isActive;
  final bool isVerified;
  final Uint8List? avatarBytes;

  /// Versión del texto de consentimiento de video aceptada; null si nunca aceptó.
  final int? videoConsentVersion;

  factory CurrentUser.fromJson(Map<String, dynamic> json) => CurrentUser(
    id: json['id'] as int,
    email: json['email'] as String,
    fullName: json['full_name'] as String,
    role: UserRole.fromApiValue(json['role'] as String),
    isActive: json['is_active'] as bool,
    isVerified: json['is_verified'] as bool,
    avatarBytes: AvatarDataUrl.decode(json['avatar_data_url'] as String?),
    videoConsentVersion: json['video_consent_version'] as int?,
  );
}
