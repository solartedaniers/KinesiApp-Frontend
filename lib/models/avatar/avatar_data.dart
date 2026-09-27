import 'dart:convert';
import 'dart:typed_data';

/// El backend entrega la foto de perfil como data URL
/// (`data:image/png;base64,...`); se decodifica una sola vez al parsear el DTO.
abstract final class AvatarDataUrl {
  static Uint8List? decode(String? dataUrl) {
    if (dataUrl == null) return null;
    final comma = dataUrl.indexOf(',');
    if (comma < 0) return null;
    try {
      return base64Decode(dataUrl.substring(comma + 1));
    } on FormatException {
      return null;
    }
  }
}

/// Foto lista para enviar a `PUT .../avatar`. Espejo de `AvatarUpload` del
/// backend: mismo límite de tamaño y mismos formatos (detectados por magic bytes).
class AvatarUpload {
  const AvatarUpload._(this.contentType, this.bytes);

  static const int maxBytes = 1000000;

  final String contentType;
  final Uint8List bytes;

  /// Null si el formato no es JPEG/PNG/WebP o si supera [maxBytes].
  static AvatarUpload? fromBytes(Uint8List bytes) {
    if (bytes.length > maxBytes) return null;
    final contentType = _detectContentType(bytes);
    return contentType == null ? null : AvatarUpload._(contentType, bytes);
  }

  Map<String, dynamic> toJson() => {
    'content_type': contentType,
    'data_base64': base64Encode(bytes),
  };

  static String? _detectContentType(Uint8List bytes) {
    bool startsWith(List<int> signature, [int offset = 0]) =>
        bytes.length >= offset + signature.length &&
        List.generate(
          signature.length,
          (i) => bytes[offset + i] == signature[i],
        ).every((matches) => matches);

    if (startsWith(const [0xFF, 0xD8, 0xFF])) return 'image/jpeg';
    if (startsWith(const [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
      return 'image/png';
    }
    if (startsWith(ascii.encode('RIFF')) &&
        startsWith(ascii.encode('WEBP'), 8)) {
      return 'image/webp';
    }
    return null;
  }
}
